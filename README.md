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
2.  **Backend (AI Service)**: Deploy the `ai_service/` directory to a persistent cloud provider. We recommend **Koyeb** for this, as they support long-lived WebSockets and Dockerfiles natively. See the Koyeb tutorial below.

---

## ☁️ AI Backend Deployment (Koyeb)

[Koyeb](https://www.koyeb.com/) is an excellent cloud platform for the Python PyTorch backend because it natively supports persistent WebSockets and seamless Docker container builds without connection timeouts.

### Step-by-Step Koyeb Deployment Tutorial

1. **Import to Koyeb**:
   - Log into Koyeb and click **Create Service**.
   - Select **GitHub** and choose your `cV2X` repository.

2. **Configure the Monorepo Path (CRITICAL)**:
   - In the advanced settings or directly in the builder config, find the **Work directory** field and enter `ai_service`. 
   - *If you skip this, Koyeb will just look at the root of the repo and fail.*

3. **Select the Builder**:
   - Choose the **Dockerfile** builder option. 
   - Koyeb will execute the `ai_service/Dockerfile`, downloading PyTorch and all your dependencies.

4. **Network & Ports**:
   - The Dockerfile exposes Port `8001` natively. Koyeb should automatically detect this and map it to the public HTTP/WS routing layer.

5. **Deploy**:
   - Click deploy! It will construct the `pytorch/pytorch` environment and boot the FastAPI Python server.

6. **Link Vercel to Koyeb**:
   - Koyeb will grant you a public live URL (e.g., `https://your-nexsim-ai.koyeb.app`).
   - Open your local code: `frontend/src/components/ThreeScene.tsx`.
   - Find the websocket connection string: `ws://localhost:8002/ws/stream`.
   - Change it to your new secure Koyeb address (ensure you swap `ws://` for `wss://`):
     `wss://your-nexsim-ai.koyeb.app/ws/stream`
   - Commit and push this change to GitHub. Vercel will automatically rebuild your frontend, and your live website will now successfully stream 4D coordinates directly from your Koyeb AI engine!
