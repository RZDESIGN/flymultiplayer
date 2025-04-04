import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { io } from 'socket.io-client';
import { createAirplane } from './airplane';

// Socket.io setup
// Replace with your actual Render URL
const socket = io('https://flymultiplayer.onrender.com', {
  transports: ['websocket', 'polling']
});

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 500, 2000);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 15, 30);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controls
//const controls = new OrbitControls(camera, renderer.domElement);
//controls.update();

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 300, 100);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
const d = 300;
directionalLight.shadow.camera.left = -d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = -d;
scene.add(directionalLight);

// Create ground
const groundGeometry = new THREE.PlaneGeometry(5000, 5000);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a5c1a,
    roughness: 0.8,
    metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Create some environment features
function createRandomEnvironment() {
    // Create mountains
    for (let i = 0; i < 20; i++) {
        const mountainGeometry = new THREE.ConeGeometry(
            50 + Math.random() * 100, 
            100 + Math.random() * 200, 
            4 + Math.floor(Math.random() * 3)
        );
        const mountainMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4d4d4d,
            roughness: 0.9,
            metalness: 0 
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(
            (Math.random() - 0.5) * 2000,
            0,
            (Math.random() - 0.5) * 2000
        );
        mountain.castShadow = true;
        mountain.receiveShadow = true;
        scene.add(mountain);
    }
    
    // Create clouds
    for (let i = 0; i < 50; i++) {
        const cloudGeometry = new THREE.SphereGeometry(
            20 + Math.random() * 30, 
            8, 
            8
        );
        const cloudMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0 
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
            (Math.random() - 0.5) * 2000,
            200 + Math.random() * 200,
            (Math.random() - 0.5) * 2000
        );
        cloud.scale.y = 0.5;
        scene.add(cloud);
    }
}

createRandomEnvironment();

// Player variables
let playerAirplane;
const otherPlayers = {};
let speed = 1;
const maxSpeed = 3;
const minSpeed = 0.5;
const speedIncrement = 0.05;

// Controls state
const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

// Create player airplane
playerAirplane = createAirplane(0x3333ff);
scene.add(playerAirplane);

// Camera offset from airplane
const cameraOffset = new THREE.Vector3(0, 5, 20);
const cameraLookOffset = new THREE.Vector3(0, 0, -10);

// Flight controls
function updateFlight() {
    if (!playerAirplane) return;
    
    // Roll (A/D)
    if (keysPressed['a']) {
        playerAirplane.rotation.z += 0.03;
    }
    if (keysPressed['d']) {
        playerAirplane.rotation.z -= 0.03;
    }
    
    // Pitch (W/S)
    if (keysPressed['w']) {
        playerAirplane.rotation.x -= 0.02;
    }
    if (keysPressed['s']) {
        playerAirplane.rotation.x += 0.02;
    }
    
    // Yaw (Q/E)
    if (keysPressed['q']) {
        playerAirplane.rotation.y += 0.02;
    }
    if (keysPressed['e']) {
        playerAirplane.rotation.y -= 0.02;
    }
    
    // Speed control (Space/Shift)
    if (keysPressed[' ']) { // Space
        speed = Math.min(maxSpeed, speed + speedIncrement);
    }
    if (keysPressed['shift']) {
        speed = Math.max(minSpeed, speed - speedIncrement);
    }
    
    // Calculate direction vector from rotation
    const direction = new THREE.Vector3(0, 0, -1);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(playerAirplane.rotation);
    direction.applyQuaternion(quaternion);
    
    // Move airplane in the direction it's facing
    playerAirplane.position.add(direction.multiplyScalar(speed));
    
    // Keep airplane from going below ground level
    if (playerAirplane.position.y < 5) {
        playerAirplane.position.y = 5;
        // Adjust pitch to prevent crashing
        if (playerAirplane.rotation.x > 0) {
            playerAirplane.rotation.x = 0;
        }
    }
    
    // Update camera position and target
    const cameraDirection = new THREE.Vector3(0, 0, 1);
    cameraDirection.applyQuaternion(quaternion);
    const cameraPosition = playerAirplane.position.clone().add(cameraDirection.multiplyScalar(20));
    cameraPosition.y += 5; // Add some height
    
    camera.position.copy(cameraPosition);
    camera.lookAt(playerAirplane.position);
    
    // Send position to server
    socket.emit('playerMovement', {
        position: playerAirplane.position,
        rotation: playerAirplane.rotation
    });
}

// Socket.io event handlers
socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
});

socket.on('currentPlayers', (players) => {
    console.log('Received currentPlayers event with data:', players);
    Object.keys(players).forEach((id) => {
        if (id !== socket.id) {
            console.log('Adding other player:', id);
            addOtherPlayer(players[id]);
        }
    });
});

socket.on('newPlayer', (playerInfo) => {
    console.log('New player joined:', playerInfo.id);
    addOtherPlayer(playerInfo);
});

socket.on('playerMoved', (playerInfo) => {
    if (otherPlayers[playerInfo.id]) {
        otherPlayers[playerInfo.id].position.copy(new THREE.Vector3(
            playerInfo.position.x,
            playerInfo.position.y,
            playerInfo.position.z
        ));
        otherPlayers[playerInfo.id].rotation.set(
            playerInfo.rotation.x,
            playerInfo.rotation.y,
            playerInfo.rotation.z
        );
    }
});

socket.on('playerDisconnected', (playerId) => {
    console.log('Player disconnected:', playerId);
    if (otherPlayers[playerId]) {
        scene.remove(otherPlayers[playerId]);
        delete otherPlayers[playerId];
    }
});

// Handle periodic updates from server
socket.on('playersUpdate', (allPlayers) => {
    console.log('Received players update:', Object.keys(allPlayers).length, 'players');
    
    // Remove players that no longer exist
    Object.keys(otherPlayers).forEach(id => {
        if (!allPlayers[id] && id !== socket.id) {
            console.log('Removing stale player:', id);
            scene.remove(otherPlayers[id]);
            delete otherPlayers[id];
        }
    });
    
    // Add or update other players
    Object.keys(allPlayers).forEach(id => {
        if (id !== socket.id) {
            if (!otherPlayers[id]) {
                console.log('Adding missing player:', id);
                addOtherPlayer(allPlayers[id]);
            } else {
                // Update position
                otherPlayers[id].position.copy(new THREE.Vector3(
                    allPlayers[id].position.x,
                    allPlayers[id].position.y,
                    allPlayers[id].position.z
                ));
                otherPlayers[id].rotation.set(
                    allPlayers[id].rotation.x,
                    allPlayers[id].rotation.y,
                    allPlayers[id].rotation.z
                );
            }
        }
    });
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

function addOtherPlayer(playerInfo) {
    console.log('Creating airplane for player:', playerInfo.id, 'with color:', playerInfo.color);
    const otherAirplane = createAirplane(parseInt(playerInfo.color.replace('#', '0x')));
    otherAirplane.position.copy(new THREE.Vector3(
        playerInfo.position.x,
        playerInfo.position.y,
        playerInfo.position.z
    ));
    otherAirplane.rotation.set(
        playerInfo.rotation.x,
        playerInfo.rotation.y,
        playerInfo.rotation.z
    );
    scene.add(otherAirplane);
    otherPlayers[playerInfo.id] = otherAirplane;
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    updateFlight();
    
    renderer.render(scene, camera);
}

animate(); 