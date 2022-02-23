import { Absolute2DPosition, AngleUnit, CallbackSinkNode, DataFrame, DataObject, GraphBuilder, Model, ModelBuilder, Orientation, TimedPullNode, TimeService, TimeSyncNode, TimeUnit } from '@openhps/core';
import { SocketClient, SocketClientSink, SocketClientSource } from '@openhps/socket';
import { RelativeRSSI, BLEObject, WLANObject } from '@openhps/rf';
import { CSVDataSource } from '@openhps/csv';
import * as path from 'path';

console.log("Creating the positioning model ...");

// Dataset specific
const timeOffset = Date.now() - 1615126640000;

ModelBuilder.create()
    .withLogger(console.log)            // Optional: useful with troubleshooting
    // Set the time to March 2021, so we basically 'delay our time'
    // Note that the 'speed' of the positioning remains the same
    .addService(new TimeService(() => Date.now() - timeOffset))
    // Create a socket client. One positioning model might have a connection to a server
    // with multiple endpoints.
    .addService(new SocketClient({
        url: "http://localhost:3000",
        path: "/api/v1"
    }))
    // BLE sensor (simulated from "test" dataset IPIN2021)
    .addShape(GraphBuilder.create()
        .from(new CSVDataSource(path.join(__dirname, "../ble_fingerprints.csv"), (row) => {
            const object = new DataObject("userUIDhere");
            const position = new Absolute2DPosition(
                parseFloat(row.X),
                parseFloat(row.Y)
            );
            position.orientation = Orientation.fromEuler({
                pitch: 0,
                roll: 0,
                yaw: parseFloat(row.ORIENTATION),
                unit: AngleUnit.DEGREE
            });
            for (let key in row) {
                const rssi = parseFloat(row[key]);
                if (key.includes("BEACON_") && rssi !== 100) {
                    object.addRelativePosition(
                        new RelativeRSSI(new BLEObject(key), rssi)
                    );
                }
            }
            const frame = new DataFrame(object);
            frame.addObject(new DataObject("EVALUATION").setPosition(position));
            frame.createdTimestamp = parseInt(row['TIMESTAMP']);
            return frame;
        }))
        // This node ensures that our data is sent with the same interval as our actual recording
        // Basically it will make sure that the WLAN/BLE data frames transmit at a similar timestamp
        // to the recording
        .via(new TimedPullNode(50, TimeUnit.MILLISECOND))
        .via(new TimeSyncNode({
            checkInterval: 100,
        }))
        .to(new SocketClientSink({
            uid: "online"
        })))
    // WLAN sensor (simulated from "test" dataset IPIN2021)
    .addShape(GraphBuilder.create()
        .from(new CSVDataSource(path.join(__dirname, "../wlan_fingerprints.csv"), (row) => {
            const object = new DataObject("userUIDhere");
            const position = new Absolute2DPosition(
                parseFloat(row.X),
                parseFloat(row.Y)
            );
            position.orientation = Orientation.fromEuler({
                pitch: 0,
                roll: 0,
                yaw: parseFloat(row.ORIENTATION),
                unit: AngleUnit.DEGREE
            });
            for (let key in row) {
                const rssi = parseFloat(row[key]);
                if (key.includes("WAP_") && rssi !== 100) {
                    object.addRelativePosition(
                        new RelativeRSSI(new WLANObject(key), rssi)
                    );
                }
            }
            const frame = new DataFrame(object);
            frame.addObject(new DataObject("EVALUATION").setPosition(position));
            frame.createdTimestamp = parseInt(row['TIMESTAMP']);
            return frame;
        }))
        // This node ensures that our data is sent with the same interval as our actual recording
        // Basically it will make sure that the WLAN/BLE data frames transmit at a similar timestamp
        // to the recording
        .via(new TimedPullNode(50, TimeUnit.MILLISECOND))
        .via(new TimeSyncNode({
            checkInterval: 100,
        }))
        .to(new SocketClientSink({
            uid: "online"
        })))
    .addShape(GraphBuilder.create()
        .from(new SocketClientSource({
            uid: "feedback"       // Matches uid of the server sink
        }))
        .to(new CallbackSinkNode((frame: DataFrame) => {
            console.log("Position from server", frame.source.position.toVector3());
            console.log("Expected position", frame.getObjectByUID("EVALUATION").position.toVector3());
            console.log("----------------------------");
        })))
    .build().then((model: Model) => {
        console.log("Client positioning model created ...");
    }).catch(console.error);
