import * as THREE from 'three';
import { gsap } from 'gsap';

// Global variables
let scene, camera, renderer, controls;
let desk, room, holographicScreens = [];
let books = [], trophies = [];
let aiJar, brainMesh;
let animationMixer, clock;
let isAnimationPlaying = true;
let currentTheme = 'cyberpunk';

// Initialize the 3D workspace
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(8, 6, 12);
    camera.lookAt(0, 2, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Add orbit controls
    addOrbitControls();
    
    // Create the workspace
    createRoom();
    createDesk();
    createHolographicScreens();
    createBookshelf();
    createTrophyShelf();
    createAIJar();
    createLighting();
    createParticles();
    
    // Start animation loop
    clock = new THREE.Clock();
    animate();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 2000);
    
    // Simulate loading progress
    simulateLoading();
}

function simulateLoading() {
    const progress = document.getElementById('progress');
    let width = 0;
    const interval = setInterval(() => {
        width += Math.random() * 20;
        if (width >= 100) {
            width = 100;
            clearInterval(interval);
        }
        progress.style.width = width + '%';
    }, 200);
}

function addOrbitControls() {
    // Simple mouse controls without external library
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let rotationX = 0, rotationY = 0;
    
    renderer.domElement.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    
    renderer.domElement.addEventListener('mousemove', (event) => {
        if (isMouseDown) {
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        }
    });
    
    renderer.domElement.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
    
    renderer.domElement.addEventListener('wheel', (event) => {
        const scale = event.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(scale);
    });
    
    // Update camera rotation
    function updateCamera() {
        rotationX += (targetRotationX - rotationX) * 0.1;
        rotationY += (targetRotationY - rotationY) * 0.1;
        
        const radius = camera.position.length();
        camera.position.x = radius * Math.sin(rotationY) * Math.cos(rotationX);
        camera.position.y = radius * Math.sin(rotationX);
        camera.position.z = radius * Math.cos(rotationY) * Math.cos(rotationX);
        camera.lookAt(0, 2, 0);
        
        requestAnimationFrame(updateCamera);
    }
    updateCamera();
}

function createRoom() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.8,
        roughness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Walls
    const wallGeometry = new THREE.PlaneGeometry(30, 15);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f0f23,
        transparent: true,
        opacity: 0.8
    });
    
    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 7.5, -15);
    scene.add(backWall);
    
    // Side walls
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-15, 7.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(15, 7.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    scene.add(rightWall);
}

function createDesk() {
    // Desk surface
    const deskGeometry = new THREE.BoxGeometry(8, 0.2, 4);
    const deskMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.6,
        roughness: 0.3
    });
    desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(0, 1.5, 0);
    desk.castShadow = true;
    scene.add(desk);
    
    // Desk legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const positions = [
        [-3.5, 0.75, -1.5],
        [3.5, 0.75, -1.5],
        [-3.5, 0.75, 1.5],
        [3.5, 0.75, 1.5]
    ];
    
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        scene.add(leg);
    });
    
    // Glowing edge effect
    const edgeGeometry = new THREE.EdgesGeometry(deskGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6
    });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edges.position.copy(desk.position);
    scene.add(edges);
}

function createHolographicScreens() {
    const screenData = [
        { pos: [-2, 3, -1], content: 'code', title: 'React App' },
        { pos: [2, 3.5, -0.5], content: 'terminal', title: 'Terminal' },
        { pos: [0, 4, -2], content: 'dashboard', title: 'Analytics' }
    ];
    
    screenData.forEach((data, index) => {
        const screenGroup = new THREE.Group();
        
        // Screen frame
        const frameGeometry = new THREE.PlaneGeometry(2.5, 1.8);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.1
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        
        // Screen content
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 384;
        const ctx = canvas.getContext('2d');
        
        // Draw screen content
        drawScreenContent(ctx, data.content, data.title);
        
        const screenTexture = new THREE.CanvasTexture(canvas);
        const screenMaterial = new THREE.MeshStandardMaterial({
            map: screenTexture,
            transparent: true,
            opacity: 0.8,
            emissive: 0x002244,
            emissiveIntensity: 0.3
        });
        
        const screen = new THREE.Mesh(frameGeometry, screenMaterial);
        screen.position.z = 0.01;
        
        screenGroup.add(frame);
        screenGroup.add(screen);
        screenGroup.position.set(...data.pos);
        screenGroup.rotation.x = -0.1;
        
        // Add holographic glow
        const glowGeometry = new THREE.PlaneGeometry(3, 2.2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.01;
        screenGroup.add(glow);
        
        scene.add(screenGroup);
        holographicScreens.push(screenGroup);
        
        // Animate screen
        gsap.to(screenGroup.rotation, {
            y: Math.sin(index) * 0.1,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
        });
    });
}

function drawScreenContent(ctx, type, title) {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 512, 384);
    
    // Title bar
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 512, 40);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = '16px monospace';
    ctx.fillText(title, 10, 25);
    
    // Content based on type
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px monospace';
    
    if (type === 'code') {
        const codeLines = [
            'import React from "react";',
            'import { useState } from "react";',
            '',
            'function App() {',
            '  const [data, setData] = useState([]);',
            '  ',
            '  useEffect(() => {',
            '    fetchData();',
            '  }, []);',
            '',
            '  return (',
            '    <div className="app">',
            '      <Header />',
            '      <Main data={data} />',
            '    </div>',
            '  );',
            '}'
        ];
        
        codeLines.forEach((line, i) => {
            ctx.fillText(line, 10, 60 + i * 18);
        });
    } else if (type === 'terminal') {
        ctx.fillStyle = '#00ff00';
        const terminalLines = [
            '$ npm run dev',
            '> vite',
            '',
            'Local:   http://localhost:3000',
            'Network: http://192.168.1.100:3000',
            '',
            '✓ ready in 1.2s',
            '',
            '$ git status',
            'On branch main',
            'Changes to be committed:',
            '  modified: src/App.js',
            '  new file: components/Workspace.js'
        ];
        
        terminalLines.forEach((line, i) => {
            ctx.fillText(line, 10, 60 + i * 18);
        });
    } else if (type === 'dashboard') {
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(50, 80, 100, 60);
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(200, 100, 80, 40);
        ctx.fillStyle = '#45b7d1';
        ctx.fillRect(320, 90, 120, 50);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.fillText('CPU: 45%', 50, 200);
        ctx.fillText('Memory: 2.1GB', 50, 220);
        ctx.fillText('Uptime: 5d 12h', 50, 240);
    }
}

function createBookshelf() {
    // Bookshelf structure
    const shelfGeometry = new THREE.BoxGeometry(0.3, 6, 3);
    const shelfMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a4a,
        roughness: 0.7
    });
    
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.set(-6, 3, -2);
    shelf.castShadow = true;
    scene.add(shelf);
    
    // Books
    const bookTitles = ['NestJS', 'React', 'Docker', 'TypeScript', 'Node.js'];
    const bookColors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf39c12, 0x9b59b6];
    
    bookTitles.forEach((title, index) => {
        const bookGeometry = new THREE.BoxGeometry(0.2, 1.2, 0.8);
        const bookMaterial = new THREE.MeshStandardMaterial({
            color: bookColors[index],
            emissive: bookColors[index],
            emissiveIntensity: 0.1
        });
        
        const book = new THREE.Mesh(bookGeometry, bookMaterial);
        book.position.set(-5.8, 1 + index * 1.2, -2 + (index % 2) * 0.5);
        book.rotation.y = (Math.random() - 0.5) * 0.2;
        book.castShadow = true;
        scene.add(book);
        books.push(book);
        
        // Floating animation
        gsap.to(book.position, {
            y: book.position.y + 0.1,
            duration: 2 + index * 0.3,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
        });
    });
}

function createTrophyShelf() {
    // Trophy shelf
    const shelfGeometry = new THREE.BoxGeometry(4, 0.2, 1);
    const shelfMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.6,
        roughness: 0.3
    });
    
    const trophyShelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    trophyShelf.position.set(3, 4, -4);
    trophyShelf.castShadow = true;
    scene.add(trophyShelf);
    
    // Trophy icons (simplified geometric representations)
    const trophyData = [
        { name: 'PostgreSQL', color: 0x336791, pos: [-1.5, 0.5, 0] },
        { name: 'MongoDB', color: 0x47a248, pos: [-0.5, 0.5, 0] },
        { name: 'Prisma', color: 0x2d3748, pos: [0.5, 0.5, 0] },
        { name: 'GraphQL', color: 0xe10098, pos: [1.5, 0.5, 0] }
    ];
    
    trophyData.forEach((trophy, index) => {
        const trophyGroup = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        
        // Trophy cup
        const cupGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const cupMaterial = new THREE.MeshStandardMaterial({
            color: trophy.color,
            emissive: trophy.color,
            emissiveIntensity: 0.2,
            metalness: 0.6,
            roughness: 0.3
        });
        const cup = new THREE.Mesh(cupGeometry, cupMaterial);
        cup.position.y = 0.2;
        
        trophyGroup.add(base);
        trophyGroup.add(cup);
        trophyGroup.position.set(
            trophyShelf.position.x + trophy.pos[0],
            trophyShelf.position.y + trophy.pos[1],
            trophyShelf.position.z + trophy.pos[2]
        );
        
        scene.add(trophyGroup);
        trophies.push(trophyGroup);
        
        // Rotation animation
        gsap.to(trophyGroup.rotation, {
            y: Math.PI * 2,
            duration: 8 + index * 2,
            repeat: -1,
            ease: "none"
        });
    });
}

function createAIJar() {
    const jarGroup = new THREE.Group();
    
    // Jar container
    const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 16);
    const jarMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.1
    });
    const jar = new THREE.Mesh(jarGeometry, jarMaterial);
    
    // Brain inside jar
    const brainGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const brainMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b9d,
        emissive: 0xff1493,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8
    });
    brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainMesh.position.y = 0.2;
    
    // Add brain texture/details
    const brainDetails = new THREE.Group();
    for (let i = 0; i < 8; i++) {
        const detailGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4757,
            emissive: 0xff3742,
            emissiveIntensity: 0.2
        });
        const detail = new THREE.Mesh(detailGeometry, detailMaterial);
        detail.position.set(
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 0.8
        );
        brainDetails.add(detail);
    }
    brainMesh.add(brainDetails);
    
    // Jar lid
    const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1);
    const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.8,
        roughness: 0.2
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 0.8;
    
    // Label
    const labelGeometry = new THREE.PlaneGeometry(1.2, 0.3);
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const labelCtx = labelCanvas.getContext('2d');
    labelCtx.fillStyle = '#ffffff';
    labelCtx.fillRect(0, 0, 256, 64);
    labelCtx.fillStyle = '#000000';
    labelCtx.font = '20px Arial';
    labelCtx.textAlign = 'center';
    labelCtx.fillText('Problem Solver', 128, 35);
    
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMaterial = new THREE.MeshStandardMaterial({ map: labelTexture });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(0, -0.3, 0.81);
    
    jarGroup.add(jar);
    jarGroup.add(brainMesh);
    jarGroup.add(lid);
    jarGroup.add(label);
    jarGroup.position.set(2, 2.5, 1);
    
    scene.add(jarGroup);
    aiJar = jarGroup;
    
    // Brain pulsing animation
    gsap.to(brainMesh.material, {
        emissiveIntensity: 0.6,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });
    
    // Brain rotation
    gsap.to(brainMesh.rotation, {
        y: Math.PI * 2,
        duration: 10,
        repeat: -1,
        ease: "none"
    });
}

function createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Desk accent lights
    const deskLight1 = new THREE.PointLight(0x00ffff, 1, 10);
    deskLight1.position.set(-3, 2, 0);
    scene.add(deskLight1);
    
    const deskLight2 = new THREE.PointLight(0xff00ff, 1, 10);
    deskLight2.position.set(3, 2, 0);
    scene.add(deskLight2);
    
    // Animated room lighting
    const roomLights = [];
    for (let i = 0; i < 5; i++) {
        const light = new THREE.PointLight(0x4444ff, 0.5, 15);
        light.position.set(
            (Math.random() - 0.5) * 20,
            5 + Math.random() * 5,
            (Math.random() - 0.5) * 20
        );
        scene.add(light);
        roomLights.push(light);
        
        // Animate light intensity
        gsap.to(light, {
            intensity: 0.8,
            duration: 2 + Math.random() * 3,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
        });
    }
}

function createParticles() {
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = Math.random() * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        
        const color = new THREE.Color();
        color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Animate particles
    gsap.to(particleSystem.rotation, {
        y: Math.PI * 2,
        duration: 60,
        repeat: -1,
        ease: "none"
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Update animations
    if (isAnimationPlaying) {
        // Rotate holographic screens slightly
        holographicScreens.forEach((screen, index) => {
            screen.rotation.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
        });
        
        // Pulse AI jar
        if (aiJar) {
            aiJar.position.y = 2.5 + Math.sin(Date.now() * 0.002) * 0.1;
        }
        
        // Animate books
        books.forEach((book, index) => {
            book.rotation.y += 0.002;
        });
    }
    
    renderer.render(scene, camera);
}

// Global functions for UI controls
window.resetCamera = function() {
    gsap.to(camera.position, {
        x: 8,
        y: 6,
        z: 12,
        duration: 1.5,
        ease: "power2.inOut"
    });
};

window.toggleAnimation = function() {
    isAnimationPlaying = !isAnimationPlaying;
};

window.switchTheme = function() {
    if (currentTheme === 'cyberpunk') {
        // Switch to clean theme
        scene.fog.color.setHex(0xf0f0f0);
        renderer.setClearColor(0xf8f8f8, 1);
        currentTheme = 'clean';
    } else {
        // Switch back to cyberpunk
        scene.fog.color.setHex(0x0a0a0a);
        renderer.setClearColor(0x000000, 0);
        currentTheme = 'cyberpunk';
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize the application
init();