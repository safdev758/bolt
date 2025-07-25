import * as THREE from 'three';
import { gsap } from 'gsap';

// Global variables
let scene, camera, renderer, controls;
let desk, room, holographicScreens = [];
let books = [], trophies = [];
let aiJar, brainMesh;
let projectGallery = [], infoCards = [];
let animationMixer, clock;
let isAnimationPlaying = true;
let currentTheme = 'cyberpunk';

// Project data with sample projects
let projectsData = [
    {
        title: "E-Commerce Platform",
        tech: "React, Node.js, MongoDB",
        description: "Full-stack shopping platform with real-time inventory",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%2300ffff'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23000'%3EE-Commerce%3C/text%3E%3C/svg%3E",
        color: "#00ffff"
    },
    {
        title: "AI Dashboard",
        tech: "Python, TensorFlow, React",
        description: "Machine learning analytics dashboard with predictions",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23ff6b9d'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23fff'%3EAI Dashboard%3C/text%3E%3C/svg%3E",
        color: "#ff6b9d"
    },
    {
        title: "Mobile Banking App",
        tech: "React Native, Firebase",
        description: "Secure mobile banking with biometric authentication",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%2345b7d1'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' font-family='Arial' font-size='18' fill='%23fff'%3EBanking App%3C/text%3E%3C/svg%3E",
        color: "#45b7d1"
    },
    {
        title: "Blockchain Explorer",
        tech: "Vue.js, Web3, Solidity",
        description: "Cryptocurrency transaction explorer and wallet tracker",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f39c12'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' font-family='Arial' font-size='18' fill='%23fff'%3EBlockchain%3C/text%3E%3C/svg%3E",
        color: "#f39c12"
    },
    {
        title: "IoT Smart Home",
        tech: "Arduino, MQTT, Node.js",
        description: "Home automation system with sensor integration",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%239b59b6'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23fff'%3ESmart Home%3C/text%3E%3C/svg%3E",
        color: "#9b59b6"
    },
    {
        title: "Social Media API",
        tech: "NestJS, GraphQL, PostgreSQL",
        description: "Scalable social media backend with real-time features",
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%234ecdc4'/%3E%3Ctext x='150' y='100' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20' fill='%23fff'%3ESocial API%3C/text%3E%3C/svg%3E",
        color: "#4ecdc4"
    }
];

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
    createProjectGallery();
    createFloatingInfoCards();
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

function createProjectGallery() {
    // Gallery wall structure
    const galleryWallGeometry = new THREE.PlaneGeometry(12, 8);
    const galleryWallMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.9,
        metalness: 0.3,
        roughness: 0.7
    });
    const galleryWall = new THREE.Mesh(galleryWallGeometry, galleryWallMaterial);
    galleryWall.position.set(-10, 4, -8);
    galleryWall.rotation.y = Math.PI / 6;
    scene.add(galleryWall);
    
    // Create project frames
    projectsData.forEach((project, index) => {
        const frameGroup = new THREE.Group();
        
        // Frame border
        const frameGeometry = new THREE.PlaneGeometry(2.2, 1.5);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a3e,
            metalness: 0.8,
            roughness: 0.2
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        
        // Project image with color filter
        const imageGeometry = new THREE.PlaneGeometry(2, 1.3);
        const imageCanvas = createProjectImageCanvas(project);
        const imageTexture = new THREE.CanvasTexture(imageCanvas);
        const imageMaterial = new THREE.MeshStandardMaterial({
            map: imageTexture,
            transparent: true,
            opacity: 0.9
        });
        const imagePanel = new THREE.Mesh(imageGeometry, imageMaterial);
        imagePanel.position.z = 0.01;
        
        // Glowing border effect
        const glowGeometry = new THREE.PlaneGeometry(2.4, 1.7);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(project.color),
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.01;
        
        frameGroup.add(frame);
        frameGroup.add(imagePanel);
        frameGroup.add(glow);
        
        // Position frames in a grid on the wall
        const col = index % 3;
        const row = Math.floor(index / 3);
        frameGroup.position.set(
            galleryWall.position.x + (col - 1) * 2.5,
            galleryWall.position.y + (1 - row) * 2,
            galleryWall.position.z + 0.1
        );
        frameGroup.rotation.y = galleryWall.rotation.y;
        
        scene.add(frameGroup);
        projectGallery.push(frameGroup);
        
        // Hover animation effect
        gsap.to(glow.material, {
            opacity: 0.4,
            duration: 2 + index * 0.3,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
        });
        
        // Subtle floating animation
        gsap.to(frameGroup.position, {
            y: frameGroup.position.y + 0.05,
            duration: 3 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
        });
    });
}

function createProjectImageCanvas(project) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 260;
    const ctx = canvas.getContext('2d');
    
    // Apply color filter to match workspace theme
    const workspaceColors = ['#00ffff', '#ff00ff', '#4444ff'];
    const filterColor = workspaceColors[Math.floor(Math.random() * workspaceColors.length)];
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 260);
    gradient.addColorStop(0, project.color + '40'); // Semi-transparent project color
    gradient.addColorStop(0.5, filterColor + '20'); // Workspace color overlay
    gradient.addColorStop(1, '#1a1a2e80'); // Dark workspace tone
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 260);
    
    // Add project title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(project.title, 200, 50);
    
    // Add tech stack
    ctx.fillStyle = filterColor;
    ctx.font = '16px Arial';
    ctx.fillText(project.tech, 200, 80);
    
    // Add description
    ctx.fillStyle = '#cccccc';
    ctx.font = '14px Arial';
    const words = project.description.split(' ');
    let line = '';
    let y = 120;
    
    words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > 350 && line !== '') {
            ctx.fillText(line, 200, y);
            line = word + ' ';
            y += 20;
        } else {
            line = testLine;
        }
    });
    ctx.fillText(line, 200, y);
    
    // Add decorative elements
    ctx.strokeStyle = filterColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 360, 220);
    
    // Add corner accents
    ctx.fillStyle = project.color;
    ctx.fillRect(20, 20, 30, 3);
    ctx.fillRect(20, 20, 3, 30);
    ctx.fillRect(350, 20, 30, 3);
    ctx.fillRect(377, 20, 3, 30);
    
    return canvas;
}

function createFloatingInfoCards() {
    const personalInfo = [
        { 
            title: "💻 Full Stack Developer", 
            content: "5+ years of experience building scalable web applications",
            color: "#00ffff",
            startPos: [-15, 8, 5],
            endPos: [-8, 6, 3]
        },
        { 
            title: "🚀 Tech Enthusiast", 
            content: "Passionate about emerging technologies and clean code",
            color: "#ff6b9d",
            startPos: [15, 9, 4],
            endPos: [8, 5, 2]
        },
        { 
            title: "🎯 Problem Solver", 
            content: "Love tackling complex challenges with innovative solutions",
            color: "#45b7d1",
            startPos: [-12, 12, -8],
            endPos: [-6, 7, -5]
        },
        { 
            title: "🌟 Team Player", 
            content: "Experienced in agile development and cross-team collaboration",
            color: "#f39c12",
            startPos: [18, 6, -6],
            endPos: [10, 4, -3]
        },
        { 
            title: "📚 Continuous Learner", 
            content: "Always exploring new frameworks and best practices",
            color: "#9b59b6",
            startPos: [-20, 15, 2],
            endPos: [-12, 8, 1]
        }
    ];
    
    personalInfo.forEach((info, index) => {
        const cardGroup = new THREE.Group();
        
        // Card background
        const cardGeometry = new THREE.PlaneGeometry(3, 1.5);
        const cardCanvas = createInfoCardCanvas(info);
        const cardTexture = new THREE.CanvasTexture(cardCanvas);
        const cardMaterial = new THREE.MeshStandardMaterial({
            map: cardTexture,
            transparent: true,
            opacity: 0.9,
            emissive: new THREE.Color(info.color),
            emissiveIntensity: 0.1
        });
        const card = new THREE.Mesh(cardGeometry, cardMaterial);
        
        // Glowing border
        const borderGeometry = new THREE.PlaneGeometry(3.2, 1.7);
        const borderMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(info.color),
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = -0.01;
        
        cardGroup.add(border);
        cardGroup.add(card);
        
        // Start at random flying position
        cardGroup.position.set(...info.startPos);
        cardGroup.rotation.set(
            (Math.random() - 0.5) * Math.PI,
            (Math.random() - 0.5) * Math.PI,
            (Math.random() - 0.5) * Math.PI
        );
        
        scene.add(cardGroup);
        infoCards.push(cardGroup);
        
        // Flying animation - cards fly in and stick to position
        const delay = index * 0.8;
        
        // Initial spinning while flying
        gsap.to(cardGroup.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 3,
            delay: delay,
            ease: "power2.out"
        });
        
        // Fly to final position
        gsap.to(cardGroup.position, {
            x: info.endPos[0],
            y: info.endPos[1],
            z: info.endPos[2],
            duration: 3,
            delay: delay,
            ease: "power2.out"
        });
        
        // Gentle floating once in position
        gsap.to(cardGroup.position, {
            y: info.endPos[1] + 0.1,
            duration: 2 + index * 0.3,
            delay: delay + 3,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
        });
        
        // Pulsing glow effect
        gsap.to(border.material, {
            opacity: 0.6,
            duration: 1.5 + index * 0.2,
            repeat: -1,
            yoyo: true,
            ease: "power2.inOut"
        });
    });
}

function createInfoCardCanvas(info) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 300);
    gradient.addColorStop(0, 'rgba(26, 26, 46, 0.9)');
    gradient.addColorStop(0.5, info.color + '40');
    gradient.addColorStop(1, 'rgba(15, 15, 35, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 300);
    
    // Border
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 580, 280);
    
    // Title
    ctx.fillStyle = info.color;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(info.title, 300, 80);
    
    // Content
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    
    // Word wrap for content
    const words = info.content.split(' ');
    let line = '';
    let y = 140;
    
    words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > 500 && line !== '') {
            ctx.fillText(line, 300, y);
            line = word + ' ';
            y += 30;
        } else {
            line = testLine;
        }
    });
    ctx.fillText(line, 300, y);
    
    // Decorative corner elements
    ctx.fillStyle = info.color;
    ctx.fillRect(10, 10, 40, 4);
    ctx.fillRect(10, 10, 4, 40);
    ctx.fillRect(550, 10, 40, 4);
    ctx.fillRect(586, 10, 4, 40);
    ctx.fillRect(10, 286, 40, 4);
    ctx.fillRect(10, 246, 4, 40);
    ctx.fillRect(550, 286, 40, 4);
    ctx.fillRect(586, 246, 4, 40);
    
    return canvas;
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
        
        // Animate project gallery glows
        projectGallery.forEach((frame, index) => {
            const time = Date.now() * 0.001;
            frame.children[2].material.opacity = 0.2 + Math.sin(time + index) * 0.1;
        });
        
        // Animate info cards gentle movement
        infoCards.forEach((card, index) => {
            const time = Date.now() * 0.0005;
            card.rotation.z = Math.sin(time + index) * 0.02;
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

window.focusGallery = function() {
    gsap.to(camera.position, {
        x: -8,
        y: 4,
        z: -2,
        duration: 2,
        ease: "power2.inOut"
    });
    
    // Make gallery glow more prominently
    projectGallery.forEach((frame, index) => {
        gsap.to(frame.children[2].material, {
            opacity: 0.6,
            duration: 1,
            delay: index * 0.1,
            ease: "power2.out"
        });
    });
};

window.resetInfoCards = function() {
    // Re-trigger the flying animation for info cards
    infoCards.forEach((card, index) => {
        const info = [
            { startPos: [-15, 8, 5], endPos: [-8, 6, 3] },
            { startPos: [15, 9, 4], endPos: [8, 5, 2] },
            { startPos: [-12, 12, -8], endPos: [-6, 7, -5] },
            { startPos: [18, 6, -6], endPos: [10, 4, -3] },
            { startPos: [-20, 15, 2], endPos: [-12, 8, 1] }
        ][index];
        
        // Reset to flying position
        gsap.set(card.position, {
            x: info.startPos[0],
            y: info.startPos[1],
            z: info.startPos[2]
        });
        
        gsap.set(card.rotation, {
            x: (Math.random() - 0.5) * Math.PI,
            y: (Math.random() - 0.5) * Math.PI,
            z: (Math.random() - 0.5) * Math.PI
        });
        
        const delay = index * 0.5;
        
        // Fly back to position
        gsap.to(card.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 2.5,
            delay: delay,
            ease: "power2.out"
        });
        
        gsap.to(card.position, {
            x: info.endPos[0],
            y: info.endPos[1],
            z: info.endPos[2],
            duration: 2.5,
            delay: delay,
            ease: "power2.out"
        });
    });
};

window.handleImageUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create a new project with the uploaded image
        const newProject = {
            title: "New Project",
            tech: "Custom Upload",
            description: "User uploaded project image",
            image: e.target.result,
            color: "#" + Math.floor(Math.random()*16777215).toString(16) // Random color
        };
        
        // Add to projects data
        projectsData.push(newProject);
        
        // Create the new frame
        addProjectToGallery(newProject, projectsData.length - 1);
        
        // Focus on the gallery to show the new addition
        focusGallery();
    };
    reader.readAsDataURL(file);
};

function addProjectToGallery(project, index) {
    const frameGroup = new THREE.Group();
    
    // Frame border
    const frameGeometry = new THREE.PlaneGeometry(2.2, 1.5);
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        metalness: 0.8,
        roughness: 0.2
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    
    // Project image with color filter
    const imageGeometry = new THREE.PlaneGeometry(2, 1.3);
    
    // Load the actual image and apply color filter
    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 260;
        const ctx = canvas.getContext('2d');
        
        // Draw the image
        ctx.drawImage(img, 0, 0, 400, 260);
        
        // Apply color filter overlay to match workspace theme
        const workspaceColors = ['#00ffff', '#ff00ff', '#4444ff'];
        const filterColor = workspaceColors[Math.floor(Math.random() * workspaceColors.length)];
        
        // Create overlay with blend mode
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = filterColor + '80'; // Semi-transparent
        ctx.fillRect(0, 0, 400, 260);
        
        // Add border and text overlay
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = filterColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 380, 240);
        
        // Add project info
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 200, 400, 60);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(project.title, 200, 225);
        
        ctx.fillStyle = filterColor;
        ctx.font = '14px Arial';
        ctx.fillText(project.tech, 200, 245);
        
        // Update texture
        const imageTexture = new THREE.CanvasTexture(canvas);
        imagePanel.material.map = imageTexture;
        imagePanel.material.needsUpdate = true;
    };
    img.src = project.image;
    
    const imageMaterial = new THREE.MeshStandardMaterial({
        transparent: true,
        opacity: 0.9
    });
    const imagePanel = new THREE.Mesh(imageGeometry, imageMaterial);
    imagePanel.position.z = 0.01;
    
    // Glowing border effect
    const glowGeometry = new THREE.PlaneGeometry(2.4, 1.7);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(project.color),
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -0.01;
    
    frameGroup.add(frame);
    frameGroup.add(imagePanel);
    frameGroup.add(glow);
    
    // Position the new frame (expand the gallery if needed)
    const totalProjects = projectsData.length;
    const col = (index) % 3;
    const row = Math.floor((index) / 3);
    
    frameGroup.position.set(
        -10 + (col - 1) * 2.5,
        4 + (1 - row) * 2,
        -8 + 0.1
    );
    frameGroup.rotation.y = Math.PI / 6;
    
    // Start with a dramatic entrance animation
    frameGroup.scale.set(0, 0, 0);
    frameGroup.position.y += 5;
    
    scene.add(frameGroup);
    projectGallery.push(frameGroup);
    
    // Entrance animation
    gsap.to(frameGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
        ease: "back.out(1.7)"
    });
    
    gsap.to(frameGroup.position, {
        y: frameGroup.position.y - 5,
        duration: 1,
        ease: "power2.out"
    });
    
    // Hover animation effect
    gsap.to(glow.material, {
        opacity: 0.4,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize the application
init();