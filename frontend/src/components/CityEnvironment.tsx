import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Clouds, Cloud } from '@react-three/drei';
import { AdvancedBuilding } from './AdvancedBuilding';
import { StreetInfrastructure } from './StreetInfrastructure';
import * as THREE from 'three';

/**
 * Dynamic Rain Particle System
 */
const RainSystem = () => {
    const count = 3000;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = Math.random() * 40;
            const z = (Math.random() - 0.5) * 100;
            const speed = 0.5 + Math.random() * 0.5;
            temp.push({ x, y, z, speed });
        }
        return temp;
    }, [count]);

    useFrame(() => {
        if (!mesh.current) return;
        particles.forEach((particle, i) => {
            particle.y -= particle.speed;
            if (particle.y < 0) particle.y = 40;
            dummy.position.set(particle.x, particle.y, particle.z);
            dummy.scale.set(0.02, 1.5, 0.02);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1, 4]} />
            <meshBasicMaterial color="#7dd3fc" transparent opacity={0.4} depthWrite={false} />
        </instancedMesh>
    );
};

export const CityEnvironment: React.FC = () => {
  const blocks = useMemo(() => {
    const list = [];
    const gridSize = 10;
    const spacing = 45;
    
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        if (Math.abs(x) < 2) continue; // Leave central avenue open
        
        const heightLevels = 3 + Math.floor(Math.random() * 12);
        const type = Math.random() > 0.4 ? 'modern' : 'classic';
        
        list.push({
          id: `${x}-${z}`,
          pos: [x * spacing, 0, z * spacing] as [number, number, number],
          h: heightLevels,
          type
        });
      }
    }
    return list;
  }, []);

  return (
    <group>
      <fog attach="fog" args={['#0f172a', 20, 300]} />
      
      {/* Cinematic Cloudy Sky System */}
      <Sky sunPosition={[0, 10, -10]} turbidity={10} rayleigh={0.1} mieCoefficient={0.05} mieDirectionalG={0.8} />
      <Clouds material={THREE.MeshBasicMaterial}>
        <Cloud segments={40} bounds={[100, 20, 100]} volume={20} color="#1e293b" position={[0, 40, 0]} opacity={0.8} speed={0.1} />
        <Cloud segments={20} bounds={[50, 10, 50]} volume={10} color="#334155" position={[0, 45, -50]} seed={2} opacity={0.5} speed={0.2} />
      </Clouds>

      <directionalLight position={[-10, 40, 20]} intensity={0.5} color="#e0f2fe" castShadow />
      <hemisphereLight groundColor="#000000" color="#1e293b" intensity={0.8} />

      {/* Dynamic Rain */}
      <RainSystem />

      <StreetInfrastructure />

      {/* Ground Plane (Reflective Asphalt) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#020617" roughness={0.7} metalness={0.1} />
      </mesh>

      <group>
        {blocks.map(b => (
          <AdvancedBuilding 
            key={b.id} 
            position={b.pos} 
            heightLevels={b.h} 
            type={b.type as any}
            width={18 + Math.random() * 10}
            depth={18 + Math.random() * 10}
          />
        ))}
      </group>

      <color attach="background" args={["#0f172a"]} /> {/* Night/Rain Sky Placeholder */}
    </group>
  );
};
