import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls as PointerLockControlsImpl } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';

export const FPSControls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const { vehicle, hud } = useStore();
  
  // Camera Offset (First Person - Driver Perspective)
  const fpOffset = new THREE.Vector3(0.4, 0.4, 0.5); // Slightly to the left/right and up
  const tpOffset = new THREE.Vector3(0, 5, 10);      // Third Person Fallback
  
  useFrame((state) => {
    if (!vehicle) return;

    // First person Driver View synchronization
    const carPos = new THREE.Vector3(...vehicle.position);
    const carRot = new THREE.Euler(...vehicle.rotation);
    
    // Calculate world position for camera inside the cockpit
    const cameraPos = fpOffset.clone().applyEuler(carRot).add(carPos);
    
    // We only update position. Rotation is handled by PointerLockControls if active,
    // otherwise it should follow the car's orientation.
    if (!controlsRef.current?.isLocked) {
        state.camera.position.lerp(cameraPos, 0.1);
        
        // Target a point in front of the car
        const lookAtTarget = new THREE.Vector3(0, 0, 5).applyEuler(carRot).add(carPos);
        state.camera.lookAt(lookAtTarget);
    } else {
        // In locked mode, the mouse controls the rotation (Free Look),
        // but the position must stay locked to the driver's head.
        state.camera.position.copy(cameraPos);
    }
  });

  return (
    <PointerLockControlsImpl 
        ref={controlsRef} 
        selector="#fps-canvas-container" 
    />
  );
};
