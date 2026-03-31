import { create } from 'zustand';

interface VehicleState {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  speed: number;
  steeringAngle: number; // Front wheel rotation in radians
}

interface Controls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  reset: boolean;
}

export interface HUDState {
  alerts: string[];
  isManualMode: boolean;
  showMap: boolean;
}

export interface PerceptionState {
  camera_front: string | null;
  miou: number;
  fps: number;
  latency_ms: number;
  is_playback: boolean;
}

interface SimulationStore {
  vehicle: VehicleState;
  controls: Controls;
  perception: PerceptionState;
  hud: HUDState;
  setVehicle: (vehicle: Partial<VehicleState>) => void;
  setControls: (controls: Partial<Controls>) => void;
  setPerception: (perception: Partial<PerceptionState>) => void;
  setHUD: (hud: Partial<HUDState>) => void;
  addAlert: (alert: string) => void;
  clearAlerts: () => void;
  reset: () => void;
}

const initialVehicle: VehicleState = {
  position: [0, 0.5, 0],
  rotation: [0, 0, 0],
  velocity: [0, 0, 0],
  angularVelocity: [0, 0, 0],
  speed: 0,
  steeringAngle: 0,
};

const initialHUD: HUDState = {
  alerts: [],
  isManualMode: false,
  showMap: true,
};

const initialControls: Controls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
  reset: false,
};

const initialPerception: PerceptionState = {
  camera_front: null,
  miou: 0,
  fps: 0,
  latency_ms: 0,
  is_playback: false,
};

export const useStore = create<SimulationStore>((set) => ({
  vehicle: initialVehicle,
  controls: initialControls,
  perception: initialPerception,
  hud: initialHUD,
  setVehicle: (vehicle) => set((state) => ({ vehicle: { ...state.vehicle, ...vehicle } })),
  setControls: (controls) => set((state) => ({ controls: { ...state.controls, ...controls } })),
  setPerception: (perception) => set((state) => ({ perception: { ...state.perception, ...perception } })),
  setHUD: (hud) => set((state) => ({ hud: { ...state.hud, ...hud } })),
  addAlert: (alert) => set((state) => ({ 
    hud: { ...state.hud, alerts: Array.from(new Set([...state.hud.alerts, alert])) } 
  })),
  clearAlerts: () => set((state) => ({ hud: { ...state.hud, alerts: [] } })),
  reset: () => set({ vehicle: initialVehicle, controls: initialControls, perception: initialPerception, hud: initialHUD }),
}));
