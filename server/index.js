const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all domains for testing
    methods: ["GET", "POST"]
  }
});

app.use(cors());

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle video offer
  socket.on('video-offer', (offer, toSocketId) => {
    io.to(toSocketId).emit('video-offer', offer, socket.id);
  });

  // Handle video answer
  socket.on('video-answer', (answer, toSocketId) => {
    io.to(toSocketId).emit('video-answer', answer);
  });

  // Handle ICE candidate
  socket.on('ice-candidate', (candidate, toSocketId) => {
    io.to(toSocketId).emit('ice-candidate', candidate);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
