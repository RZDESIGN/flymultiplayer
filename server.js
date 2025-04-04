const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // Allow your Hostinger domain to connect
    origin: ["https://hytopiacolor.games", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Add a simple route for testing
app.get('/', (req, res) => {
  res.send('Socket.IO server for Fly Multiplayer is running');
});

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Server is running',
    players: Object.keys(players).length
  });
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
    color: '#' + Math.floor(Math.random() * 16777215).toString(16)
  };
  
  // Send the current state of all players to the new player
  socket.emit('currentPlayers', players);
  
  // Broadcast the new player to all other players
  socket.broadcast.emit('newPlayer', players[socket.id]);
  
  // Handle player movement updates
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].position = movementData.position;
      players[socket.id].rotation = movementData.rotation;
      
      // Broadcast the updated player position to all other players
      io.emit('playerMoved', {
        id: socket.id,
        position: players[socket.id].position,
        rotation: players[socket.id].rotation
      });
    }
  });
  
  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// Send periodic updates to all clients to ensure sync
setInterval(() => {
  io.emit('playersUpdate', players);
}, 3000); // Send updates every 3 seconds

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 