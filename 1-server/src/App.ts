/**
 * This file contains the server logic.
 */

import { CallbackSinkNode, ModelBuilder } from '@openhps/core';
import { SocketServer, SocketServerSource } from '@openhps/socket';
import * as http from 'http';

export class App {
    server: http.Server;

    constructor() {
        this.initServer();
        this.initModel();
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
    protected async initModel(): Promise<void> {
        await ModelBuilder.create()
            .withLogger(console.log)            // Optional: useful with troubleshooting
            // We add a socket server service. One positioning model can have multiple 'endpoints'
            // that use the same server. The endpoints are the nodes, the server is the service we add here
            .addService(new SocketServer({
                srv: this.server,               // Server to use for socket server
                path: "/api/v1",                // Base URI for the socket server
            }))
            .from(new SocketServerSource({
                uid: "test",                    // Test socket endpoint
            }))
            // A callback node is an easy node for prototyping and debugging, it allows you to define
            // a function.
            .to(new CallbackSinkNode(frame => {
                // Log the frame in the console
                console.log(frame);
            }))
            .build();
        console.log("Model is ready!");
    }
}
