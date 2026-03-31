import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

/**
 * Nuclear Reset: Zero-Shader Vehicle
 * Uses MeshBasicMaterial to bypass lighting and texture unit limits.
 */
const SteeringWheel = ({ angle }: { angle: number }) => {
  return (
    <group position={[0.4, 0.4, 0.5]} rotation={[0, 0, angle]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 16, 32]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.25, 0.04, 0.02]} />
        <meshBasicMaterial color="#222" />
      </mesh>
    </group>
  );
};

export const SportsCar = () => {
  const { vehicle } = useStore();
  const vehicleData = vehicle || { position: [0, 0, 0], rotation: [0, 0, 0], steeringAngle: 0 };
  const group = useRef<THREE.Group>(null);
  
  const miou = useStore(state => state.perception.miou) || 85;
  const bodyColor = new THREE.Color().lerpColors(
    new THREE.Color('#ff0033'),
    new THREE.Color('#00ccff'),
    Math.max(0, Math.min(1, (miou - 50) / 40))
  );

  return (
    <group 
        ref={group} 
        position={vehicleData.position || [0, 0, 0]} 
        rotation={vehicleData.rotation || [0, 0, 0]}
    >
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.8, 0.5, 4.2]} />
        <meshBasicMaterial color={bodyColor} />
      </mesh>

      <mesh position={[0, 0.6, -0.2]}>
        <boxGeometry args={[1.4, 0.4, 1.8]} />
        <meshBasicMaterial color="#000" />
      </mesh>

      <mesh position={[0, 0.45, 1.2]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.6, 0.1, 1]} />
        <meshBasicMaterial color={bodyColor} />
      </mesh>

      <mesh position={[1, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.1, 3.8]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[-1, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.1, 3.8]} />
        <meshBasicMaterial color="#111" />
      </mesh>

      <group position={[0, 0.6, -1.8]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.9, 0.05, 0.4]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      </group>

      <mesh position={[0.7, 0.3, 2.15]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.7, 0.3, 2.15]}>
        <boxGeometry args={[0.3, 0.15, 0.05]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* Wheels */}
      <group position={[-1.0, 0, 1.4]} rotation={[0, vehicle.steeringAngle, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      </group>
      <group position={[1.0, 0, 1.4]} rotation={[0, vehicle.steeringAngle, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 24]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      </group>
      <group position={[-1.0, 0, -1.4]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.32, 24]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      </group>
      <group position={[1.0, 0, -1.4]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.32, 24]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      </group>

      <SteeringWheel angle={vehicle.steeringAngle * 5} />
    </group>
  );
};
