## OpenHPS: Server Example (8)
This is a simple example of how to set up a server that uses OpenHPS. The example creates an additional endpoint for storing data and also
uses clustering to offer multiple services listening on the same port. In addition we send the calculated position back to the client.

### What will you learn?
- Set up a basic server that uses OpenHPS
- Set up a data service that stores `BLEObject`s in memory
- Set up a socket connection on port 3000
- Set up a socket connection that broadcasts calculated positions (clients can listen to it but will see all information)
- Set up a multilateration positioning algorithm

### What will you not learn?
- Authorization of the socket server (any client can access it)
- Client specific sending of data to a client

### Installation
1. Clone the repository
2. Run `npm install` to install the dependencies
    - We use `@openhps/core`, `@openhps/socket` and `@openhps/rf` as the OpenHPS modules
    - Alternatively you may replace the socket module with `@openhps/rest`

### Testing
Once you have set-up the server, you can test it using the client example.