import React, { useMemo } from 'react';
import { BuildingPart } from './BuildingPart';

interface AdvancedBuildingProps {
  position: [number, number, number];
  width?: number;
  depth?: number;
  heightLevels?: number;
  type?: 'classic' | 'modern' | 'park';
}

export const AdvancedBuilding: React.FC<AdvancedBuildingProps> = ({ 
  position, 
  width = 5, 
  depth = 5, 
  heightLevels = 3,
  type = 'classic'
}) => {
  const parts = useMemo(() => {
    const buildingParts = [];
    let currentHeight = 0;

    // Base (Plinth / Sidewalk)
    const baseHeight = 1;
    buildingParts.push({
      id: 'base',
      pos: [0, baseHeight / 2, 0],
      args: [width + 2, baseHeight, depth + 2],
      type: 'base',
      color: "#334155",
      hasWindows: false
    });
    currentHeight += baseHeight;

    // Body (Main building)
    const bodyHeight = heightLevels * 4;
    buildingParts.push({
      id: 'body',
      pos: [0, currentHeight + bodyHeight / 2, 0],
      args: [width, bodyHeight, depth],
      type: 'body',
      color: type === 'modern' ? "#0f172a" : "#1e293b",
      hasWindows: true
    });
    currentHeight += bodyHeight;

    // Top (Roof / Cap)
    const topHeight = 2;
    buildingParts.push({
      id: 'top',
      pos: [0, currentHeight + topHeight / 2, 0],
      args: [width - 0.5, topHeight, depth - 0.5],
      type: 'top',
      color: "#0f172a",
      hasWindows: false
    });

    return buildingParts;
  }, [width, depth, heightLevels, type]);

  return (
    <group position={position}>
      {parts.map((p: any) => (
        <BuildingPart
          key={p.id}
          position={p.pos}
          args={p.args}
          type={p.type}
          color={p.color}
          hasWindows={p.hasWindows}
        />
      ))}
    </group>
  );
};
