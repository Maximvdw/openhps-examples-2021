## OpenHPS: Server Example (6)
This is a simple example of how to set up a server that uses OpenHPS. The example creates an additional endpoint for storing data and also
uses clustering to offer multiple services listening on the same port.

### What will you learn?
- Set up a basic server that uses OpenHPS
- Set up a data service that stores `BLEObject`s in memory
- Set up a socket connection on port 3000
- Set up a multilateration positioning algorithm
- Set up a knn fingerprinting algorithm
- Load a dataset

### What will you not learn?
- Authorization of the socket server (any client can access it)

### Installation
1. Clone the repository
2. Run `npm install` to install the dependencies
    - We use `@openhps/core`, `@openhps/socket` and `@openhps/rf` as the OpenHPS modules
    - Alternatively you may replace the socket module with `@openhps/rest`

### Testing
Once you have set-up the server, you can test it using the client notebook example.