import React, { useMemo } from 'react';

/**
 * Nuclear Reset: Zero-Shader Infrastructure
 * Guaranteed to render on all WebGL-capable hardware.
 */
interface StreetLightProps {
  position: [number, number, number];
}

const StreetLight: React.FC<StreetLightProps> = ({ position }) => {
  return (
    <group position={position}>
      {/* Light Post */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.08, 0.15, 8, 6]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
      
      {/* Arm */}
      <mesh position={[0.4, 7.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 6]} />
        <meshBasicMaterial color="#111827" />
      </mesh>

      {/* Bulb (Basic) */}
      <mesh position={[0.7, 7.7, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#fcd34d" />
      </mesh>
    </group>
  );
};

export const StreetInfrastructure: React.FC = () => {
  const lights = useMemo(() => {
    const list = [];
    const spacing = 60;
    const count = 15;
    for (let i = -count; i < count; i++) {
        list.push({ id: `L-${i}-L`, pos: [-12, 0, i * spacing] });
        list.push({ id: `R-${i}-R`, pos: [12, 0, i * spacing] });
    }
    return list;
  }, []);

  return (
    <group>
      {/* Absolute Minimum Road Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[24, 2000]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Basic Lane Markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.3, 2000]} />
        <meshStandardMaterial color="#fcd34d" emissive="#fcd34d" emissiveIntensity={0.2} roughness={0.9} />
      </mesh>

      {/* Basic Boundary Lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-11.8, 0.01, 0]}>
        <planeGeometry args={[0.15, 2000]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#e2e8f0" emissiveIntensity={0.1} roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[11.8, 0.01, 0]}>
        <planeGeometry args={[0.15, 2000]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#e2e8f0" emissiveIntensity={0.1} roughness={0.8} />
      </mesh>

      {/* Optimized Streetlights */}
      <group>
        {lights.map(l => (
          <StreetLight key={l.id} position={l.pos as [number, number, number]} />
        ))}
      </group>
    </group>
  );
};
