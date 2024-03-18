const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User${socket.id} has connected`);

  socket.on("join-room", (data) => {
    socket.join(data.room);
    console.log(
      `user ${data.name} with socket id ${socket.id} joined room no :${data.room}`
    );
  });

  socket.on("message", (data) => {
    console.log(
      `User ${data.author} sent the message : ${data.currentMessage} at  : ${data.time} in room Id : ${data.room}`
    );
    socket.to(data.room).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User${socket.id} has disconnected`);
  });
});

server.listen(3001, () => console.log("Server is running!"));
