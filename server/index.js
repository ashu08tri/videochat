const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://videochaat.netlify.app", // Allowing the specific frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "https://videochaat.netlify.app" // Allowing the specific frontend
}));

// Keep track of connected users
let connectedUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Add new user to the list
  connectedUsers[socket.id] = socket.id;

  // Send the list of connected users to the client
  socket.emit("update-user-list", Object.keys(connectedUsers).filter((id) => id !== socket.id));

  // Notify other clients of the new user
  socket.broadcast.emit("new-user", socket.id);

  // Handle video offer
  socket.on('video-offer', (offer, toSocketId) => {
    io.to(toSocketId).emit('video-offer', offer, socket.id);
  });

  // Handle video answer
  socket.on('video-answer', (answer, toSocketId) => {
    io.to(toSocketId).emit('video-answer', answer);
  });

  // Handle ICE candidates
  socket.on('ice-candidate', (candidate, toSocketId) => {
    io.to(toSocketId).emit('ice-candidate', candidate);
  });

  // Remove user on disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete connectedUsers[socket.id];
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
