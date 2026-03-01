import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GameLibrary3D = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(5, 5, 10);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mountRef.current.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
        controls.enableZoom = true;
        controls.maxPolarAngle = Math.PI / 2;

        // Lighting
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404060);
        scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        scene.add(directionalLight);

        // Fill lights
        const fillLight1 = new THREE.PointLight(0xffaa00, 0.5);
        fillLight1.position.set(-3, 2, 4);
        scene.add(fillLight1);

        const fillLight2 = new THREE.PointLight(0x00aaff, 0.5);
        fillLight2.position.set(4, 3, -2);
        scene.add(fillLight2);

        // Create floor with grid
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x888888);
        gridHelper.position.y = 0;
        scene.add(gridHelper);

        const floorGeometry = new THREE.BoxGeometry(20, 0.1, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, transparent: true, opacity: 0.5 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, -0.05, 0);
        floor.receiveShadow = true;
        scene.add(floor);

        // Back wall
        const wallGeometry = new THREE.BoxGeometry(20, 5, 0.5);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3a });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(0, 2.5, -8);
        wall.receiveShadow = true;
        wall.castShadow = true;
        scene.add(wall);

        // Create bookshelves
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffcc5c, 0xff6f69];

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                // Shelf base
                const shelfBase = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 0.2, 1.5),
                    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
                );
                shelfBase.position.set(-6 + i * 6, 0.5 + j * 2, 4);
                shelfBase.receiveShadow = true;
                shelfBase.castShadow = true;
                scene.add(shelfBase);

                // Shelf sides
                const sideLeft = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 1.8, 1.5),
                    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
                );
                sideLeft.position.set(-7.5 + i * 6, 1.4 + j * 2, 4);
                sideLeft.receiveShadow = true;
                sideLeft.castShadow = true;
                scene.add(sideLeft);

                const sideRight = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 1.8, 1.5),
                    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
                );
                sideRight.position.set(-4.5 + i * 6, 1.4 + j * 2, 4);
                sideRight.receiveShadow = true;
                sideRight.castShadow = true;
                scene.add(sideRight);

                // Add game boxes on shelves
                for (let k = 0; k < 4; k++) {
                    const gameBox = new THREE.Mesh(
                        new THREE.BoxGeometry(0.4, 0.8, 0.2),
                        new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] })
                    );
                    gameBox.position.set(
                        -7.2 + i * 6 + k * 0.8,
                        1.0 + j * 2,
                        4.2
                    );
                    gameBox.receiveShadow = true;
                    gameBox.castShadow = true;
                    scene.add(gameBox);
                }
            }
        }

        // Add decorative floating game discs
        const discPositions = [-4, -2, 0, 2, 4];
        discPositions.forEach((x, index) => {
            const discGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
            const discMaterial = new THREE.MeshStandardMaterial({
                color: colors[index % colors.length],
                emissive: 0x222222
            });
            const disc = new THREE.Mesh(discGeometry, discMaterial);
            disc.position.set(x, 4, -2);
            disc.receiveShadow = true;
            disc.castShadow = true;
            scene.add(disc);
        });

        // Add a central pedestal with glowing orb
        const pedestalBase = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1.2, 0.3, 8),
            new THREE.MeshStandardMaterial({ color: 0x666666 })
        );
        pedestalBase.position.set(0, 0.15, -2);
        pedestalBase.receiveShadow = true;
        pedestalBase.castShadow = true;
        scene.add(pedestalBase);

        const pedestalColumn = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        pedestalColumn.position.set(0, 1.0, -2);
        pedestalColumn.receiveShadow = true;
        pedestalColumn.castShadow = true;
        scene.add(pedestalColumn);

        // Add a glowing orb
        const orbGeometry = new THREE.SphereGeometry(0.4, 32);
        const orbMaterial = new THREE.MeshStandardMaterial({
            color: 0x44aaff,
            emissive: 0x224466
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0, 1.8, -2);
        orb.receiveShadow = true;
        orb.castShadow = true;
        scene.add(orb);

        // Animation loop
        let clock = new THREE.Clock();

        const animate = () => {
            const delta = clock.getDelta();
            const elapsedTime = performance.now() / 1000;

            // Rotate the orb
            orb.rotation.y = elapsedTime * 0.5;

            // Make discs float
            scene.children.forEach(child => {
                if (child.geometry && child.geometry.type === 'CylinderGeometry' && child.position.y > 3) {
                    child.position.y = 4 + Math.sin(elapsedTime * 2 + child.position.x) * 0.3;
                }
            });

            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '400px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
        />
    );
};

export default GameLibrary3D;