# Fly Multiplayer

A simple Three.js multiplayer flying game where players control low-poly airplanes in a shared 3D environment.

## Features

- Real-time multiplayer with Socket.IO
- 3D flying controls with physics
- Low-poly visual style
- Environment with mountains and clouds

## Controls

- **W/S**: Pitch forward/backward
- **A/D**: Roll left/right
- **Q/E**: Yaw left/right
- **Space**: Increase speed
- **Shift**: Decrease speed

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/flymultiplayer.git
cd flymultiplayer
```

2. Install dependencies
```
npm install
```

### Running the Game

Run both the client and server together:
```
npm run dev
```

Or run them separately:
```
npm run dev:client
npm run dev:server
```

The client will be available at http://localhost:5173 by default.

## Technologies Used

- Three.js for 3D rendering
- Socket.IO for real-time networking
- Express for the web server
- Vite for development and building

## How It Works

- The server manages the state of all connected players
- Clients send position and rotation updates to the server
- The server broadcasts these updates to all other connected players
- Each client renders the scene and all player airplanes locally

## License

ISC 