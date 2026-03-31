import * as THREE from 'three';

/**
 * Material Singleton Hub
 * Centralizes texture allocation to prevent WebGL MAX_TEXTURE_IMAGE_UNITS(16) overflow.
 * Reuses the ported 'Three.js-City' realistic assets.
 */

// Texture Loader (Cached)
const loader = new THREE.TextureLoader();

const loadTexture = (path: string) => {
  const tex = loader.load(path);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

// Singleton Map
const materials: Record<string, THREE.MeshPhongMaterial> = {};

export const getUrbanMaterial = (type: 'office' | 'residential' | 'road' | 'sidewalk' | 'base') => {
  if (materials[type]) return materials[type];

  let material: THREE.MeshPhongMaterial;

  switch (type) {
    case 'office':
      material = new THREE.MeshPhongMaterial({
        map: loadTexture('/textures/offices.jpg'),
        shininess: 30,
        emissive: "#1e3a8a",
        emissiveIntensity: 0.1
      });
      break;
    case 'residential':
      material = new THREE.MeshPhongMaterial({
        map: loadTexture('/textures/residential.jpg'),
        shininess: 10
      });
      break;
    case 'road':
      material = new THREE.MeshPhongMaterial({
        map: loadTexture('/textures/roadposz.jpg'),
        color: "#1e293b",
        shininess: 5
      });
      break;
    case 'sidewalk':
      material = new THREE.MeshPhongMaterial({
        map: loadTexture('/textures/sidewalk_1.jpg'),
        color: "#475569",
        shininess: 0
      });
      break;
    default:
      material = new THREE.MeshPhongMaterial({
        color: "#0f172a",
        shininess: 0
      });
  }

  materials[type] = material;
  return material;
};
