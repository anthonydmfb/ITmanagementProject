const WebSocket = require("ws");
const readline = require("readline");

const fs = require('fs');



const CLIENT_PORT = 5000; // Use the port number you prefer for the client

const SERVER_URL = `ws://67.82.120.209:${CLIENT_PORT}`;


// glitch.me requires us to explicitly show a user agent.
const socket = new WebSocket(SERVER_URL);



socket.on("open", function () {
    console.log("Connected to the server!");
});


function isBase64Encoded(content) {
    try {
        return Buffer.from(content, 'base64').toString('base64') === content;
    } catch (err) {
        return false;
    }
}


function isHexEncoded(content) {
    try {
        return Buffer.from(content, 'hex').toString('hex') === content;
    } catch (err) {
        return false;
    }
}

socket.on("message", function (message) {

    const receivedData = JSON.parse(message);
    if (receivedData.filename && receivedData.content) {
        console.log("Received file:", receivedData.filename);

        // Decode the base64 content and write it to a file
        const isBase64 = isBase64Encoded(receivedData.content);

        const isHex = isHexEncoded(receivedData.content);

        let decodedContent;

        if (isBase64) {
            decodedContent = Buffer.from(receivedData.content, 'base64');
        } else if (isHex) {
            decodedContent = Buffer.from(receivedData.content, 'hex');
        } else {
            decodedContent = receivedData.content;
        }


        fs.writeFileSync(receivedData.filename, decodedContent);
        fs.writeFileSync("encryptedData.txt", receivedData.content);

        console.log("File downloaded:", receivedData.filename);
        console.log("File downloaded:", "encryptedData.txt");
    } else {
        console.log("Received message from server:" + message);
    }


});

// Event handler for any errors that occur with the WebSocket connection
socket.on("error", function (error) {
    console.error("WebSocket error: ", error);
});


socket.on("close", function (code, reason) {
    console.log(
        "WebSocket connection closed with code: " + code + ", reason: " + reason
    );
});
// Ctrl+ C to close connection
process.on("SIGINT", function () {
    console.log("Closing the WebSocket connection...");
    socket.close();
    process.exit(0);
});

// Read user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Continuously read user input and send messages to the server
rl.on("line", (input) => {
    const objToSend = {
        key1: input,
        key2: 'anthonydmfb2090@gmail.com'
    }
    socket.send(JSON.stringify(objToSend));
});   