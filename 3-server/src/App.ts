/**
 * This file contains the server logic.
 */

import { Absolute3DPosition, CallbackSinkNode, DataFrame, DataObjectService, GraphBuilder, LengthUnit, MemoryDataService, Model, ModelBuilder } from '@openhps/core';
import { SocketServer, SocketServerSource } from '@openhps/socket';
import { RFTransmitterObject } from '@openhps/rf';
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
            // In this case we create a shape for our 'test' endpoint
            .addShape(GraphBuilder.create()
                .from(new SocketServerSource({
                    uid: "test",                    // Test socket endpoint
                }))
                // A callback node is an easy node for prototyping and debugging, it allows you to define
                // a function.
                .to(new CallbackSinkNode(frame => {
                    // Log the frame in the console
                    console.log(frame);
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
            dataFrame.addObject(new RFTransmitterObject("5DC48FBFB912")
                .setPosition(new Absolute3DPosition(0, 5, 3, LengthUnit.METER)));
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
