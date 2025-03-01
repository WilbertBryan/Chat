const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer();
const io = socketIo(server);

io.on("connection",(socket) =>{
    console.log(`Client ${socket.id} connected`);

    socket.on("disconnect", () =>{
        console.log(`Client ${socket.id} disconnected`);
    })
    //membuat channel/socket message
    socket.on("message", (data) =>{
        let {username, message} = data;
        console.log(`Receiving message from ${username}: ${message} `);

        // Broadcast ke user lain
        // Server akan kirim ke client melalui channel message
        message = message + " (modified by server)";
        io.emit("message", {username, message});
    })
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});