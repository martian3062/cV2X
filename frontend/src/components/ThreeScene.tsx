"use client";

import React, { Suspense, useEffect, useRef, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { SportsCar } from './SportsCar';
import { FPSControls } from './FPSControls';
import { CityEnvironment } from './CityEnvironment';
import { ManualVehicleController } from './ManualVehicleController';
import { DrivingControlsUI } from './DrivingControlsUI';

/**
 * Premium Glassmorphic HUD POD
 */
const HUDOverlay = memo(() => {
  const speed = useStore((state) => state.vehicle.speed);
  const perception = useStore((state) => state.perception);
  const isManualMode = useStore((state) => state.hud.isManualMode);
  
  // Hide HUD POD if in manual mode to prefer DrivingControlsUI
  if (isManualMode) return null;

  return (
    <div className="absolute top-6 right-6 p-5 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-none z-50 min-w-[240px] shadow-2xl">
      <div className="flex flex-col text-white">
        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 opacity-80 font-mono">
          SYSTEM_STATE: {perception.is_playback ? '4D_UPLINK' : 'ACTIVE_LINK'}
        </label>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-mono font-bold tracking-tighter">
            {Math.round(speed || 0)}
          </span>
          <span className="text-blue-500/60 text-sm font-black italic uppercase tracking-widest">KM/H</span>
        </div>
      </div>
    </div>
  );
});

const CameraHUD = memo(() => {
    const perception = useStore((state) => state.perception);
    if (!perception.camera_front) return null;

    return (
        <div className="absolute bottom-6 right-6 w-80 aspect-video bg-black/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-40 group pointer-events-auto transition-transform hover:scale-105">
            <img src={perception.camera_front} className="w-full h-full object-cover opacity-90" alt="Front" />
            <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600/80 rounded text-[9px] font-bold text-white uppercase font-mono tracking-tighter">
                SENSE_CAM_A1
            </div>
        </div>
    );
});

const SimulationBridge = () => {
    const perceptionWs = useRef<WebSocket | null>(null);
    const setPerception = useStore((state) => state.setPerception);
    const setVehicleState = useStore((state) => state.setVehicle);

    useEffect(() => {
        // Standardize on tunnel port 8002 (matching main.py)
        perceptionWs.current = new WebSocket(`ws://localhost:8002/ws/stream`);

        perceptionWs.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                setPerception({
                    camera_front: data.sensor_data?.camera_front,
                    miou: data.metrics?.miou || 85,
                    fps: data.metrics?.fps || 32,
                    latency_ms: data.metrics?.latency_ms || 120,
                    is_playback: true 
                });
                
                // Only update position if we are NOT in manual mode
                const isManual = useStore.getState().hud.isManualMode;
                if (!isManual && data.sensor_data?.ego_pose) {
                    const { translation, rotation } = data.sensor_data.ego_pose;
                    setVehicleState({
                        position: translation || [0, 0, 0],
                        rotation: rotation || [0, 0, 0],
                        speed: 45 // Dummy speed for visualization
                    });
                }
            } catch (e) {
                console.warn("SimBridge: Stream Sync Warning", e);
            }
        };
        
        return () => perceptionWs.current?.close();
    }, [setPerception, setVehicleState]);

    return null;
};

export const ThreeScene = ({ overlayImageUrl }: { overlayImageUrl?: string }) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#030712] overflow-hidden">
      <Canvas 

        camera={{ position: [0, 2.5, 9], fov: 65 }}
        gl={{ 
            antialias: true, 
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true 
        }}
      >
        <Suspense fallback={null}>
          <SimulationBridge />
          <FPSControls />
          <ManualVehicleController />
          
          <ambientLight intensity={1.5} />
          
          {/* Direct Rendering - No Physics Conflict */}
          <SportsCar />
          <CityEnvironment />

          <color attach="background" args={["#030712"]} />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none z-10">
        <HUDOverlay />
        <CameraHUD />
        <DrivingControlsUI />
      </div>
    </div>
  );
};
