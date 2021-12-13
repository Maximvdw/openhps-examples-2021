import { Absolute2DPosition, DataFrame, DataObject, LengthUnit, Model, ModelBuilder } from '@openhps/core';
import { SocketClient, SocketClientSink } from '@openhps/socket';

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
        uid: "test"
    }))
    .build().then((model: Model) => {
        console.log("Client positioning model created ...");

        // Send a data frame every 5 seconds
        setInterval(() => {
            console.log("Sending a new data frame to the server ...");
            // New data frame
            model.push(new DataFrame(
                // ... with a data object as the source
                new DataObject(
                    "mvdewync", 
                    "Maxim Van de Wynckel"
                )
                // ... and a fixed 2d position
                .setPosition(new Absolute2DPosition(
                    1, 
                    2, 
                    LengthUnit.METER
                ))
            ));
        }, 5000);
    }).catch(console.error);
