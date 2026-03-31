import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

/**
 * Manual Vehicle Controller
 * Handles kinematic car movement when 'Manual Override' mode is active.
 * Binds WASD/Arrow keys and on-screen controls to the 3D vehicle state.
 */
export const ManualVehicleController = () => {
    const setVehicle = useStore(state => state.setVehicle);
    const setControls = useStore(state => state.setControls);

    // Keyboard bindings
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'arrowup'].includes(key)) setControls({ forward: true });
            if (['s', 'arrowdown'].includes(key)) setControls({ backward: true });
            if (['a', 'arrowleft'].includes(key)) setControls({ left: true });
            if (['d', 'arrowright'].includes(key)) setControls({ right: true });
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'arrowup'].includes(key)) setControls({ forward: false });
            if (['s', 'arrowdown'].includes(key)) setControls({ backward: false });
            if (['a', 'arrowleft'].includes(key)) setControls({ left: false });
            if (['d', 'arrowright'].includes(key)) setControls({ right: false });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [setControls]);

    // Kinematic physics loop
    useFrame((_, delta) => {
        const state = useStore.getState();
        // Only drive if manual mode is enabled
        if (!state.hud.isManualMode) return;

        const { controls, vehicle } = state;
        const currentPos = new THREE.Vector3(...vehicle.position);
        
        // Physics constants
        const ACCELERATION = 15.0;
        const DECELERATION = 8.0;
        const MAX_SPEED = 40.0;
        const STEERING_SPEED = 2.0;

        // Calculate speed
        let speed = vehicle.speed;
        if (controls.forward) {
            speed += ACCELERATION * delta;
        } else if (controls.backward) {
            speed -= ACCELERATION * delta;
        } else {
            // Natural deceleration
            if (speed > 0) speed = Math.max(0, speed - DECELERATION * delta);
            if (speed < 0) speed = Math.min(0, speed + DECELERATION * delta);
        }

        speed = THREE.MathUtils.clamp(speed, -MAX_SPEED / 2, MAX_SPEED);

        // Calculate Steering
        let steeringAngle = vehicle.steeringAngle;
        if (controls.left) {
            steeringAngle = Math.min(steeringAngle + STEERING_SPEED * delta, 0.6);
        } else if (controls.right) {
            steeringAngle = Math.max(steeringAngle - STEERING_SPEED * delta, -0.6);
        } else {
            // Auto-center steering
            steeringAngle = THREE.MathUtils.lerp(steeringAngle, 0, delta * 5);
        }

        // Apply rotation based on steering and speed
        // The car turns faster when moving, reverses steering logic when going backward
        const speedCoefficient = speed / MAX_SPEED;
        const rotationY = vehicle.rotation[1] + (steeringAngle * speedCoefficient * delta * 2.5);

        // Apply velocity vector
        const velocity = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY).multiplyScalar(speed);
        
        currentPos.add(velocity.clone().multiplyScalar(delta));

        // Note: speed in visual km/h is roughly magnitude * 3.6
        setVehicle({
            position: [currentPos.x, currentPos.y, currentPos.z],
            rotation: [0, rotationY, 0],
            speed: speed,
            steeringAngle: steeringAngle,
        });
    });

    return null;
};
