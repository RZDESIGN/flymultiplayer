const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Serve static files
app.use(express.static(path.join(__dirname, '../../dist')));

// Add a simple route for testing
app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// For all other routes, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Store connected players
const players = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Initialize new player
  players[socket.id] = {
    id: socket.id,
    position: { x: 0, y: 10, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    // Use brighter, more distinct colors
    color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8000', '#8000FF'][
      Math.floor(Math.random() * 8)
    ]
  };
  
  // Send the current state of all players to the new player
  socket.emit('currentPlayers', players);
  
  // Broadcast the new player to all other players
  socket.broadcast.emit('newPlayer', players[socket.id]);
  
  // Handle player movement updates
  socket.on('playerMovement', (movementData) => {
    players[socket.id].position = movementData.position;
    players[socket.id].rotation = movementData.rotation;
    
    // Broadcast the updated player position to all other players
    socket.broadcast.emit('playerMoved', {
      id: socket.id,
      position: players[socket.id].position,
      rotation: players[socket.id].rotation
    });
  });
  
  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 