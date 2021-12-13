## OpenHPS: Server Example (1)
This is a simple example of how to set up a server that uses OpenHPS. The example does not make use of any performance optimizations, does not use any positioning algorithms and simple outputs a serialized data frame in the console when it is received.

### What will you learn?
- Set up a basic server that uses OpenHPS
- Set up a socket connection on port 3000

### What will you not learn?
- Setting up positioning algorithms or techinques
- Authorization of the socket server (any client can access it)
- Performance optimization and clustering

### Installation
1. Clone the repository
2. Run `npm install` to install the dependencies
    - We use `@openhps/core` and `@openhps/socket` as the OpenHPS modules
    - Alternatively you may replace the socket module with `@openhps/rest`

### Testing
Run the server with `npm start`. It should give a message in the console saying that the model has been created.
Once you see this, run example `2-client`.