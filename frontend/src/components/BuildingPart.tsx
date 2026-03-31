import React, { useMemo } from 'react';
import * as THREE from 'three';

interface BuildingPartProps {
  position: [number, number, number];
  args: [number, number, number];
  type: 'base' | 'body' | 'top';
  color?: string;
  hasWindows?: boolean;
}

export const BuildingPart: React.FC<BuildingPartProps> = ({ 
  position = [0, 0, 0], 
  args = [1, 1, 1], 
  type = 'body', 
  color = "#1e293b",
}) => {
  // Generate a dynamic window texture
  const windowTexture = useMemo(() => {
    if (type !== 'body') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    // Background (Dark)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 64, 64);
    
    // Windows (Glowing)
    ctx.fillStyle = Math.random() > 0.5 ? '#7dd3fc' : '#fef08a';
    for (let x = 4; x < 64; x += 16) {
      for (let y = 4; y < 64; y += 16) {
        if (Math.random() > 0.3) {
          ctx.fillRect(x, y, 8, 10);
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(args[0] / 8, args[1] / 8); 
    return texture;
  }, [type, args]);

  const baseColor = type === 'top' ? "#1e293b" : (type === 'base' ? "#0f172a" : "#020617");

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      {windowTexture ? (
        <meshStandardMaterial 
          color={baseColor} 
          roughness={0.2} 
          metalness={0.8}
          emissiveMap={windowTexture}
          emissive="white"
          emissiveIntensity={1.5}
        />
      ) : (
        <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.2} />
      )}
    </mesh>
  );
};
