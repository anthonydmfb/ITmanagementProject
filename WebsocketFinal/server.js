const WebSocket = require("ws");
const nodemailer = require('nodemailer');
const fs = require('fs');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Function to generate a unique client ID
function generateClientId() {
    return Math.random().toString(36).substr(2, 9);
}

// Function to add a new client to the clients Map
function addClient(socket) {
    clientId = generateClientId();
    clients.set(clientId, socket);
    return clientId;
}

// Function to remove a client from the clients Map
function removeClient(clientId) {
    clients.delete(clientId);
}

// Function to broadcast a message to all clients except the sender




// Function to send a message to a specific client by ID
function sendMessageToClient(clientId, message) {
    const clientSocket = clients.get(clientId);
    if (clientSocket) {
        clientSocket.send(JSON.stringify(message));
        console.log("Tried to send message to client");
    }
}

function determineTargetClient(msg, clientId) {
    const availableClients = Array.from(clients.keys()).filter(
        (id) => id !== clientId
    );
    const targetIndex = parseInt(msg) - 1;
    const targetClient = availableClients[targetIndex];
    return targetClient;
}

function modifySampleFile() {
    const filePath = 'sample.txt'; // Replace with the actual path to the file

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        // Modify the content of the file
        const modifiedContent = data.replace(
            /Firmware version: \d+\.\d+\.\d+/,
            'Firmware version: 9.0.0' // Change the firmware version here
        );

        fs.writeFile(filePath, modifiedContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('Sample file modified.');
        });
    });
}




// Keep track of connected clients using a Map with unique identifiers
const clients = new Map();
const registeredClientIds = [];

////////////////////////////////////////////////
if (isMainThread) {
    const PORT = 5000;
    const webServer = new WebSocket.Server({
        port: PORT
    });

    webServer.on("connection", function (socket, request) {
        const worker = new Worker(__filename);

        worker.on('message', (message) => {
            socket.send(JSON.stringify(message));
        });

        const clientId = addClient(socket);
        const clientIp = request.socket.remoteAddress; // Get the client's IP address
        console.log("\n" + "A client is connected with ID: " + clientId + " with client IP " + clientIp);
        registeredClientIds.push(clientId);






        let menuCounter = 0;



        socket.send(JSON.stringify(`Enter 1 to message the server, Enter 2 to message another client, 3 for sending email, 4 for downloading file, 5 for security update, 6 for firmware updates, 7 for authentication`));


        socket.on("message", function (message) {

            const receivedObj = JSON.parse(message);
            let msg = receivedObj.key1;
            console.log("Received message from client: " + msg);

            if (msg === "2") {
                const availableClients = Array.from(clients.keys()).filter(
                    (id) => id !== clientId
                );
                const clientsList = availableClients
                    .map((id, index) => `${index + 1}) ${id}`)
                    .join(", ");

                // Send the list of clients back to the requesting client
                socket.send(JSON.stringify(`Available clients:  + ${clientsList}`));
                menuCounter++;


            }
            else if (msg === "3") {
                let transport = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    secureConnection: true,
                    port: 465,
                    auth: {
                        user: "rrvra0118@gmail.com",
                        pass: "bmglrermxlfwdmil"
                    }
                })
                let mailOptions = {
                    from: "rrvra0118@gmail.com",
                    to: receivedObj.key2,
                    subject: "Recommend us to other users!",
                    text: "Recommend us to other users",
                    attachments: [{
                        filename: "test1.txt",
                        content: "We also offer a wide select of other services so please feel free to contact us at rrvra0118@gmail.com"
                    }]
                }
                transport.sendMail(mailOptions, function (err, response) {
                    if (err) console.log(err)
                    else console.log(response)
                })
            }

            else if (msg === "4") {
                worker.postMessage("Downloading file");
            }
            else if (msg === "5") {
                // Switch the encoding mode between base64 and hex
                const filePath = 'sample.txt'; // Replace with the actual path to the file
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }
                    // encoding
                    const hexdata = Buffer.from(data).toString('hex');
                    const fileObject = {
                        filename: 'file2.txt',
                        content: hexdata
                    };

                    socket.send(JSON.stringify(fileObject));
                });

            } else if (msg === "6") {

                modifySampleFile();
                socket.send(JSON.stringify("Firmware updated"));

                const filePath = 'sample.txt'; // Replace with the actual path to the file
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }
                    // encoding

                    const fileObject = {
                        filename: 'file3.txt',
                        content: data
                    };

                    socket.send(JSON.stringify(fileObject));
                });

            } else if (msg === "7") {
                socket.send(JSON.stringify("Enter your client ID to authenticate: "));

                socket.on("message", function (message) {
                    const receivedObj = JSON.parse(message);
                    let msg = receivedObj.key1;
                    if (registeredClientIds.includes(msg)) {
                        socket.send(JSON.stringify("Authenticated"));

                    } else {
                        socket.send(JSON.stringify("Authentication failed. You're gone."));
                        socket.close();
                    }
                });
            } else if (menuCounter === 1) {
                let targetClient = determineTargetClient(msg, clientId);
                sendMessageToClient(targetClient, "Message from another client: Hello!");
            }
        });
        socket.on("close", function () {
            removeClient(clientId);
            worker.terminate();
            console.log("Client with ID " + clientId + " disconnected.");
        });
    });


    console.log(new Date() + " Server is running on port " + PORT);
} else {
    parentPort.on('message', (message) => {
        const filePath = 'sample.txt'; // Replace with the actual path to the file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            // encoding
            const base64Data = Buffer.from(data).toString('base64');
            const fileObject = {
                filename: 'file.txt',
                content: base64Data
            };
            parentPort.postMessage(fileObject);
        });
    });
}