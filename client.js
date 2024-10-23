const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto");

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

let username = "";

// Function to hash the message using SHA-256
function hashMessage(message) {
    return crypto.createHash('sha256').update(message).digest('hex');
}

socket.on("connect", () => {
    console.log("Connected to the server");

    rl.question("Enter your username: ", (input) => {
        username = input;
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt();

        rl.on("line", (message) => {
            if (message.trim()) {
                // Hash the message
                const hashedMessage = hashMessage(message);

                // Send the plain message and its hash to the server
                socket.emit("message", { username, message, hash: hashedMessage });
            }
            rl.prompt();
        });
    });
});

// Penerima chat
socket.on("message", (data) => {
    const { username: senderUsername, message: senderMessage, hash: senderHash } = data;

    // If message is from another user, verify it
    if (senderUsername !== username) {
        const computedHash = hashMessage(senderMessage);

        // Check if the received hash matches the computed hash
        if (computedHash === senderHash) {
            console.log(`${senderUsername} (verified): ${senderMessage}`);
        } else {
            console.log(`${senderUsername} (warning - tampered): ${senderMessage}`);
        }
        rl.prompt();
    }
});

socket.on("disconnect", () => {
    console.log("Server disconnected, Exiting...");
    rl.close();
    process.exit(0);
});

rl.on("SIGINT", () => {
    console.log("\nExiting...");
    socket.disconnect();
    rl.close();
    process.exit(0);
});