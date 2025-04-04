import * as THREE from 'three';

export function createAirplane(color = 0x3333ff) {
    // Create airplane group
    const airplane = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1, 1, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.5,
        metalness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    airplane.add(body);
    
    // Cockpit
    const cockpitGeometry = new THREE.BoxGeometry(0.8, 0.5, 1);
    const cockpitMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.1,
        metalness: 0.9
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.4, -0.5);
    cockpit.castShadow = true;
    airplane.add(cockpit);
    
    // Nose 
    const noseGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const noseMaterial = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.5,
        metalness: 0.7
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0, -2.5);
    nose.castShadow = true;
    airplane.add(nose);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(6, 0.2, 1.5);
    const wingMaterial = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.5,
        metalness: 0.6
    });
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.castShadow = true;
    airplane.add(wing);
    
    // Tail
    const tailGeometry = new THREE.BoxGeometry(2, 0.8, 0.2);
    const tailMaterial = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.5,
        metalness: 0.6
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, 0.5, 1.8);
    tail.castShadow = true;
    airplane.add(tail);
    
    // Vertical stabilizer
    const vStabilizerGeometry = new THREE.BoxGeometry(0.2, 1.2, 1);
    const vStabilizerMaterial = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.5,
        metalness: 0.6
    });
    const vStabilizer = new THREE.Mesh(vStabilizerGeometry, vStabilizerMaterial);
    vStabilizer.position.set(0, 0.7, 1.8);
    vStabilizer.castShadow = true;
    airplane.add(vStabilizer);
    
    // Propeller
    const propellerGeometry = new THREE.BoxGeometry(0.1, 2, 0.2);
    const propellerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.5,
        metalness: 0.8
    });
    const propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
    propeller.position.set(0, 0, -3);
    propeller.castShadow = true;
    airplane.add(propeller);
    
    // Initial position and rotation
    airplane.position.set(0, 10, 0);
    
    return airplane;
} 