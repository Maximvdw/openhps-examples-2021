/**
 * This file contains the server logic.
 */

import { Absolute3DPosition, CallbackSinkNode, DataFrame, DataObjectService, GraphBuilder, LengthUnit, MemoryDataService, Model, ModelBuilder, MultilaterationNode } from '@openhps/core';
import { SocketServer, SocketServerSource } from '@openhps/socket';
import { PropagationModel, RelativeRSSIProcessing, RFTransmitterObject } from '@openhps/rf';
import * as http from 'http';

export class App {
    server: http.Server;
    model: Model;

    constructor() {
        this.initialize();
    }

    protected async initialize(): Promise<void> {
        this.initServer();
        await this.initModel();
        // Initialize fixed beacons
        // This function will be executed for every 'worker'
        // because we have an in-memory database
        await this.initBeacons();
    }

    /**
     * Initialize the server
     */
    protected initServer(): void {
        this.server = http.createServer().listen(3000);
    }

    /**
     * Initialize the positioning model
     */
    protected initModel(): Promise<void> {
        return new Promise((resolve, reject) => {
            ModelBuilder.create()
            // We add a socket server service. One positioning model can have multiple 'endpoints'
            // that use the same server. The endpoints are the nodes, the server is the service we add here
            .addService(new SocketServer({
                srv: this.server,               // Server to use for socket server
                path: "/api/v1",                // Base URI for the socket server
            }))
            // A data service for storing data objects of the type RFTransmitterObject. We store the objects
            // in memory for this example
            .addService(new DataObjectService(new MemoryDataService(RFTransmitterObject)))
            // Graph shapes are a good way to structure your process network
            // In this case we create a shape for our 'online' endpoint
            .addShape(GraphBuilder.create()
                .from(new SocketServerSource({
                    uid: "online",                    // online socket endpoint
                }))
                // We assume that the data frames that we receive have a source object
                // We also assume that this source object has relative positions to other objects (beacons) in RSSI
                // First we have to convert this RSSI to a distance using a propagation formula
                .via(new RelativeRSSIProcessing({
                    // We use a LOG distance propagation model
                    // https://en.wikipedia.org/wiki/Log-distance_path_loss_model
                    propagationModel: PropagationModel.LOG_DISTANCE,
                    // Default 'gamma' environment variable if not set for the beacon
                    defaultEnvironmentFactor: 2.0,
                }))
                // Our relative positions that were previously only in RSSI are now in distance
                // Use this to perform trilateration
                .via(new MultilaterationNode({
                    minReferences: 1,               // Minimum amount of beacons that need to be in range
                    maxReferences: 9,               // Maximum amount of beacons to use in the calculation
                    maxIterations: 1000,            // Maximum iterations for the nonlinear-least squares algorithm
                }))
                // A callback node is an easy node for prototyping and debugging, it allows you to define
                // a function.
                .to(new CallbackSinkNode(frame => {
                    // Log the position in the console
                    console.log(frame.source.getPosition().toVector3());
                }))
            )
            // We create an additional shape for our 'calibration' endpoint
            .addShape(GraphBuilder.create()
                .from(new SocketServerSource({
                    uid: "calibration",              // Calibration socket endpoint
                }))
                // Every sink node can store data. However, seeing we do not need to do anything specific in our sink
                // we just use a simple store sink alias
                .store()
            )
            .build().then(model => {
                console.log("Model is ready!");
                this.model = model;
                resolve();
            }).catch(reject);
        });
    }

    protected initBeacons(): Promise<void> {
        return new Promise((resolve, reject) => {
            // We will create one data frame to calibrate all data objects
            // that we know as a developer
            const dataFrame = new DataFrame();

            // The UID of the beacons are the mac addresses. The position is in 3D
            // Alternative you could load the beacons from a JSON file

            // Beacons have a set of settings that can either be configured per beacon or globally
            const beacon1 = new RFTransmitterObject("5DC48FBFB912")
                .setPosition(new Absolute3DPosition(0, 5, 3, LengthUnit.METER));
            beacon1.environmentFactor = 2.0; // This is the "n" or gamma in the propagation formula (https://en.wikipedia.org/wiki/Log-distance_path_loss_model)
            beacon1.calibratedRSSI = -69; // Calibrated RSSI at 1 meter distance
            dataFrame.addObject(beacon1);
            dataFrame.addObject(new RFTransmitterObject("3E182D702D4C")
                .setPosition(new Absolute3DPosition(10, 3, 3, LengthUnit.METER)));
            dataFrame.addObject(new RFTransmitterObject("027615A1D1B6")
                .setPosition(new Absolute3DPosition(15, 2, 3, LengthUnit.METER)));
            dataFrame.addObject(new RFTransmitterObject("75A50BDC6C42")
                .setPosition(new Absolute3DPosition(9, 1, 3, LengthUnit.METER)));

            // Detect whenever the data is stored
            this.model.onceCompleted(dataFrame.uid).then(() => {
                // Confirm that our data is stored
                return this.model.findDataService(RFTransmitterObject).count();
            }).then(count => {
                console.log(`There are ${count} beacons stored in the data service!`);
                resolve();
            }).catch(reject);

            // Push the data frame to the calibration part of the model
            this.model.findNodeByUID("calibration").push(dataFrame);
        });
    }
}
