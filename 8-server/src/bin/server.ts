/**
 * This is the entry point of the server. It is the file that is executed
 * and starts the server.
 */

import { App } from "../App";
const cluster = require('cluster');

if (cluster.isMaster) {
    // Create 4 workers that fork this process
    for (let i = 0 ; i < 4 ; i++) {
        cluster.fork();
    }
} else {
    // If the process is not the primary process (but a worker) we create a new app
    // This will mean that the positioning model is created multiple times
    new App();
}
