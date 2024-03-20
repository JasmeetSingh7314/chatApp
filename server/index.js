const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const ADMIN = "ADMIN";

const usersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};

function buildAdminMsg(author, message) {
  return {
    author,
    message,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}
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
    //Joining the socket to the room
    socket.join(data.room);
    //Sending the welcome message
    socket.emit(
      "message",
      buildAdminMsg(ADMIN, "Welcome to this chat application!")
    );

    usersState.setUsers([...usersState.users, { ...data, id: socket.id }]);
    console.log(usersState.users);

    const user = usersState.users.find((user) => user.id === socket.id);

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        buildAdminMsg(ADMIN, `${user.name} has joined the chat!`)
      );
    const RoomUsers = usersState.users.filter(
      (person) => person.room === user.room
    );
    console.log("The number of people are:", RoomUsers);

    console.log(
      `user ${data.name} with socket id ${socket.id} joined room no :${data.room}`
    );
    // socket.broadcast.to(data.room).emit("message", data);
  });

  socket.on("users", (data) => {
    const RoomUsers = usersState.users.filter(
      (person) => person.room === data.room
    );
    socket.emit("usersList", {
      users: RoomUsers,
      number: RoomUsers.length,
      message: buildAdminMsg(
        ADMIN,
        `There are currently ${RoomUsers.length} people out there!`
      ),
    });
    console.log("People in room are:", RoomUsers);
  });

  socket.on("message", (data) => {
    console.log(
      `User ${data.author} sent the message : ${data.currentMessage} at  : ${data.time} in room Id : ${data.room}`
    );

    socket.to(data.room).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log(`User${socket.id} has disconnected`);

    const user = usersState.users.find((user) => user.id == socket.id);
    console.log(user);

    socket.broadcast
      .to(user.room)
      .emit("message", buildAdminMsg(ADMIN, `${user.name} has left the chat`));
    usersState.setUsers([
      ...usersState.users.filter((user) => user.id !== socket.id),
    ]);

    console.log(usersState.users);
  });
});

server.listen(3001, () => console.log("Server is running!"));
