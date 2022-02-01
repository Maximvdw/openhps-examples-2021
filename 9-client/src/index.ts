import { CallbackSinkNode, DataFrame, DataObject, GraphBuilder, Model, ModelBuilder } from '@openhps/core';
import { SocketClient, SocketClientSink, SocketClientSource } from '@openhps/socket';
import { RelativeRSSI, BLEObject } from '@openhps/rf';
import { GraphShape } from '@openhps/core/dist/types/graph/_internal/implementations';

console.log("Creating the positioning model ...");

ModelBuilder.create()
    .withLogger(console.log)            // Optional: useful with troubleshooting
    // Create a socket client. One positioning model might have a connection to a server
    // with multiple endpoints.
    .addService(new SocketClient({
        url: "http://localhost:3000",
        path: "/api/v1"
    }))
    .addShape(GraphBuilder.create()
        // Empty source, we manually push data
        .from()
        // Socket sink, data is transmitted to a server on port 3000
        .to(new SocketClientSink({
            uid: "online"
        })))
    .addShape(GraphBuilder.create()
        .from(new SocketClientSource({
            uid: "output"       // Matches uid of the server sink
        }))
        .to(new CallbackSinkNode(frame => {
            console.log("Response from server", frame.source.position.toVector3());
        })))
    .build().then((model: Model) => {
        console.log("Client positioning model created ...");

        setTimeout(() => {
            const dataFrame = new DataFrame();
            dataFrame.source = new DataObject("mvdewync", "Maxim Van de Wynckel");
            // Example has two relative beacons with same RSSI (so the position should be in the middle if the calibration data is the same)
            dataFrame.source.addRelativePosition(new RelativeRSSI(new BLEObject("5DC48FBFB912"), -50));
            dataFrame.source.addRelativePosition(new RelativeRSSI(new BLEObject("3E182D702D4C"), -50));
            
            console.log("Sending data frame ...");
            model.push(dataFrame);
        }, 500);
    }).catch(console.error);
