const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");

// Create an Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    cors: true,
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

app.use(
  cors({
    origin: JSON.parse(process.env.ALLOWED_ORIGINS),
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  const jsonMessage = {
    greeting: "Welcome to the WebRTC!",
    description: "This is a WebRTC application using Socket.IO.",
    timestamp: new Date(),
    author: "Ma Ýes",
  };

  res.json(jsonMessage);
});

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

const port = process.env.PORT || 8000;

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
