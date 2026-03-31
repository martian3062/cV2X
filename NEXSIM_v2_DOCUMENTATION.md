# MAHE NexSim v2 - Autonomous Perception Simulator

> [!NOTE]
> **Project Overview**
> MAHE NexSim v2 is a production-grade, full-stack WebGL simulation and AI diagnostic dashboard. It combines a high-fidelity 3D driving environment with real-time neural network telemetry streaming from a local Python FastAPI backend.

---

## 🏗 System Architecture & Tech Stack

### Frontend (User Interface & 3D Engine)
- **Framework:** Next.js 14 (App Router) & React 19.
- **Styling:** Tailwind CSS (Strict flexbox inline constraints).
- **3D Graphics:** Three.js, React Three Fiber (R3F), `@react-three/drei`.
- **Data Visualization:** Recharts (Area, Line, and Radar charts).

### Backend (AI Service & Telemetry)
- **Framework:** FastAPI / Python 3.10.
- **Machine Learning:** PyTorch (Optimized for 16GB RAM / 4GB GPU VRAM environments).
- **Communication:** High-frequency WebSockets (`ws://localhost:8002/ws/stream`) for zero-latency telemetry payload streaming.

---

## 🎯 Core Features & Sub-Systems

### 1. Viewport Grid (70/30 Strict Split)
The dashboard employs an unbreakable `70vw / 30vw` structural lock, completely bypassing conventional framework media queries to guarantee desktop stability:
- **Left Panel (70%):** Dedicated entirely to the borderless 3D WebGL render and tactical HUD overlay. 
- **Right Panel (30%):** Dedicated to the high-density `AnalyticsPanel`, maintaining an uninterrupted column for dense, scrolling data without triggering horizontal layout collapse.

### 2. High-Fidelity 3D Environment
The simulator has been upgraded from basic placeholder graphics to a premium, emissive cityscape:
- **Volumetric Weather:** Utilizes `@react-three/drei`'s `<Sky>` and `<Cloud>` systems to generate realistic, overcast atmospheric effects. The Y-axis sun position is tuned to diffuse light effectively onto the clouds.
- **Extended Draw Distance:** The `fog` clipping plane is pushed to `300` units, allowing deep cloud geometry and distant skyscrapers to render without premature culling.
- **PBR Architecture:** Buildings now inherit `MeshStandardMaterial` properties integrated with procedural `canvas` textures to generate randomized, glowing high-rise windows.

### 3. Neural Diagnostics Panel
A "cyber-operations" themed analytics dashboard designed to process the AI backend's streams:
- **Resilient Rendering:** All `Recharts` graphs feature extensive fail-safes (e.g., `Number(value || 0)`) to gracefully handle zero-state arrays or WebSocket disconnects without crashing the React tree.
- **Perception Radar:** Live rendering of detected spatial boundaries via angular radar plots.
- **Training Telemetry:** Live visualization of `Convergence Loss` and `mIoU Scores`.
- **Hardware Telemetry:** Displays hardware state (Local 4GB VRAM optimization mode).

---

## 🚀 Local Development Setup

> [!TIP]
> **Hardware Requirements:** The AI Backend has been specifically optimized to operate smoothly on machines with **16GB System RAM** and **4GB GPU VRAM**.

### 1. AI Backend Initialization
Use a Python `3.10` virtual environment to isolate the heavy ML dependencies:
```bash
cd ai_service
python -m venv venv
# Activate the environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*The AI Service will run on `http://localhost:8002`.*

### 2. Next.js Frontend Initialization
Launch the modern React 19 environment:
```bash
cd frontend
pnpm install
pnpm run dev
```
*The frontend will boot on `http://localhost:3000`.*

---

## 🔮 Future Roadmap (Stage 3)
1. **Collision Physics:** Attach `@react-three/cannon` boundary boxes to the emissive buildings to prevent the ego-vehicle from passing through architecture during manual override.
2. **NuScenes Synchronization:** Sync the 3D car's trajectory perfectly to the translated matrices fed via the PyTorch NuScenes dataloader.
3. **Dynamic Time-of-Day:** Expose the `<Sky>` `sunPosition` to a slider in the HUD, allowing operators to transition smoothly between daylight and pitch-black night operations.
