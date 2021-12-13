import { Absolute2DPosition, DataFrame, DataObject, LengthUnit, Model, ModelBuilder } from '@openhps/core';
import { SocketClient, SocketClientSink } from '@openhps/socket';
import { RelativeRSSI } from '@openhps/rf';

console.log("Creating the positioning model ...");

ModelBuilder.create()
    .withLogger(console.log)            // Optional: useful with troubleshooting
    // Create a socket client. One positioning model might have a connection to a server
    // with multiple endpoints.
    .addService(new SocketClient({
        url: "http://localhost:3000",
        path: "/api/v1"
    }))
    // Empty source, we manually push data
    .from()
    // Socket sink, data is transmitted to a server on port 3000
    .to(new SocketClientSink({
        uid: "online"
    }))
    .build().then((model: Model) => {
        console.log("Client positioning model created ...");

        const dataFrame = new DataFrame();
        dataFrame.source = new DataObject("mvdewync", "Maxim Van de Wynckel");
        // Example has two relative beacons with same RSSI (so the position should be in the middle if the calibration data is the same)
        dataFrame.source.addRelativePosition(new RelativeRSSI("5DC48FBFB912", -50));
        dataFrame.source.addRelativePosition(new RelativeRSSI("3E182D702D4C", -50));
        model.push(dataFrame);
    }).catch(console.error);
