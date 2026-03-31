# MAHE NexSim v2 - Autonomous Perception Simulator

![MAHE Mobility](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-2.x-ee4c2c.svg)

MAHE NexSim v2 is a production-grade, full-stack WebGL simulation and AI diagnostic dashboard. It merges a high-fidelity 3D driving environment (Three.js/Fiber) with real-time neural network telemetry streaming from a localized PyTorch backend.

## 🌟 Key Features
*   **Dual-Environment Architecture:** Strict `70/30` split combining an immersive WebGL viewport with a dense, non-collapsing glassmorphic diagnostics panel.
*   **Zero-Latency WebSockets:** The Python backend directly beams 3D space coordinates, bounding boxes, and performance metrics (mIoU/Loss) to the browser at 30 FPS.
*   **Volumetric Environment:** Features randomized procedurally-textured buildings, PBR weather (rain, fog, clouds), and buttery-smooth React 19 Framer Motion transitions.

---

## 🚀 Local Development (Quick Start)

The easiest way to boot the stack is via Docker.
Ensure Docker Desktop is running.

```bash
# Clone the repository
git clone https://github.com/martian3062/cV2X.git
cd cV2X

# Spin up all containers (Backend CPU + Frontend)
make up

# View the frontend at http://localhost:3000
```

*Note: For full GPU acceleration, refer to the manual Python initialization found in `NEXSIM_v2_DOCUMENTATION.md`.*

---

## ☁️ Production Deployment (Vercel)

Deploying the NexSim **Frontend** to Vercel is highly recommended due to its native Next.js 14 optimizations. 

### Step-by-Step Vercel Deployment Tutorial

1. **Push to GitHub**:
   Ensure this repository is pushed to your GitHub account (which you've done).

2. **Import into Vercel**:
   - Log into [Vercel](https://vercel.com/) and click **Add New... > Project**.
   - Connect your GitHub account and import the `cV2X` repository.

3. **Configure the Build Settings (CRITICAL)**:
   Since this is a monorepo structure, you **must** tell Vercel where the Next.js app lives.
   - **Framework Preset**: Vercel should auto-detect `Next.js`.
   - **Root Directory**: Click "Edit" and change this to `frontend`. This tells Vercel to ignore the Python backend folders.
   - **Build Command**: Leave as default (`next build` / `npm run build`).
   - **Install Command**: Leave as default (`npm install`).

4. **Add Environment Variables (Optional)**:
   If you have a production backend running, you can pass environment keys here (e.g., `NEXT_PUBLIC_WS_URL=wss://your-backend-server.com/ws/stream`).
   
   *(Note: By default, `ThreeScene.tsx` attempts to connect to `ws://localhost:8002`. You will need to change this if your backend is hosted online!)*

5. **Deploy**:
   Click the **Deploy** button. Vercel will install the Node modules, build the Three.js assets, and generate a live HTTPS URL for the simulator.

### ⚠️ Important Architecture Note
Vercel is a **Serverless** platform. Serverless functions **do not support persistent, long-lived WebSockets** or heavy PyTorch GPU modeling.

To make the app function entirely in production:
1.  **Frontend**: Deploy the `frontend/` directory to **Vercel** (as shown above).
2.  **Backend (AI Service)**: Deploy the `ai_service/` directory to a persistent cloud provider (like Render, AWS EC2, DigitalOcean, or an L4 GPU VM) because it requires uninterrupted execution for PyTorch and WebSockets.
3.  **Link Them**: Update the websocket connection inside `frontend/src/components/ThreeScene.tsx` from `ws://localhost:8002...` to point to the new `wss://...` URL of your deployed Python AI service.
