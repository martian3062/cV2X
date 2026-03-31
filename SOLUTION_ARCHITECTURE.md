# MAHE NexSim v2 - Technology Stack & Architecture Report

## Overview
This document outlines the detailed technology stack used in the MAHE NexSim v2 Simulator, specifically explaining **what** technologies are utilized, **why** they were selected, the **directory structure**, and the **system approach/methodology** used to construct this high-performance, AI-driven autonomous perception simulator.

---

## 1. Directory Structure 📁

The repository is modularly decoupled into specific micro-environments:

*   **`ai_service/`**: The core AI Engine. Runs Python 3.10 and PyTorch. Contains the deep learning models (`FusionNet`), the training loops, and a standalone FastAPI server (`main.py`) dedicated to streaming low-latency tensor data and video frames over WebSockets.
*   **`backend/`**: The standard web server. Runs Django. Handles persistent business logic, REST APIs for external system communication, task queuing (e.g., Celery), and user authentication. It is intentionally separated from the AI service so heavy tensor math doesn't block standard database requests.
*   **`frontend/`**: The client-side application. Built with Next.js 14 and React 19. Houses the entire UI, including the `src/components/ThreeScene.tsx` (the 3D WebGL render) and `src/components/AnalyticsPanel.tsx` (the neural telemetry dashboard). State is managed here globally using Zustand.
*   **`Makefile` & `docker-compose.yml`**: The root-level orchestration files that spin up all the above services into synchronized Docker containers with a single command (`make up`).

---

## 2. System Approach & Methodology ⚙️

### A. The 70/30 Viewport Strategy
Instead of heavily relying on complex CSS media queries that collapse on small screens, the architecture employs a strictly enforced, unbreakable **70vw / 30vw flexbox constraint**.
*   **70% (Left Panel):** Dedicated to the immersive 3D WebGL environment. It requires maximum screen real-estate to view spatial data.
*   **30% (Right Panel):** A dedicated, vertically scrolling analytics column. 
*   **Why:** This design pattern guarantees that the operator always has visual context of the driving scene while simultaneously viewing dense, high-frequency neural metrics without the UI shifting or collapsing abruptly.

### B. Decoupled AI streaming (Zero-Latency WebSockets)
To simulate real-world autonomous driving, standard HTTP REST API polling is vastly insufficient due to processing overhead. 
*   **The Approach:** The `ai_service` opens a direct, persistent WebSocket connection (`ws://localhost:8002/ws/stream`) strictly for the frontend.
*   **Execution:** As the PyTorch loop generates its 30 FPS calculations, OpenCV instantly converts the sensor matrix into a lightweight Base64 string. The XYZ ego-poses and bounding box detections are grouped into a JSON packet and blasted through the WebSocket. The Next.js `ThreeScene.tsx` catches this stream and updates the 3D car position instantly, bypassing traditional React bottlenecks.

### C. Resilient Frontend State Management
When receiving 30+ payload updates a second, a standard React `useState` hook approach would cause catastrophic re-rendering loops and crash the browser.
*   **The Approach:** We utilize **Zustand** (`useStore.ts`) to hold the global simulation state outside of the React render cycle. Components subscribe *only* to the specific slice of data they need. If the `radar` data updates, the 3D vehicle geometry does NOT re-render. Everything is isolated for peak client-side performance.

---

## 3. Frontend & User Interface 🖥️

### Next.js 14 (App Router) & React 19
- **Why it was used:** Provides a robust, highly optimized environment for the React application. React 19 brings concurrent rendering improvements built for complex UIs that handle high-frequency state updates.

### Tailwind CSS
- **Why it was used:** Allows rapid styling directly in TSX files. It made enforcing the rigid 70/30 split and "glassmorphic" panel styling incredibly fast.

### Three.js, React Three Fiber (R3F) & @react-three/drei
- **Why it was used:** 
  - **React Three Fiber:** Enables building a high-fidelity 3D layer (the simulated driving world) using declarative React syntax. 
  - **@react-three/drei:** Provided optimized 3D utilities (e.g., `<Sky>`, `<Cloud>`) that radically decreased the time needed to build cinematic weather and lighting.

### Framer Motion & Recharts
- **Why they were used:** **Framer Motion** powers the buttery smooth micro-animations. **Recharts** was selected because it reliably renders complex SVG charts (Line, Area, Radar) for live neural telemetry without crashing on null data streams.

---

## 4. Artificial Intelligence & Backend 🧠

### Python 3.10 & PyTorch
- **Why it was used:** The undisputed industry standard for AI. PyTorch powers the `MultiSensorFusionNet`. It was chosen for its dynamic computation graph and its ability to be aggressively optimized for edge hardware (e.g., 16GB RAM / 4GB Local VRAM).

### FastAPI (AI Service)
- **Why it was used:** Selected for its native asynchronous capabilities (`asyncio`). This async foundation is critical to host non-blocking WebSocket streams that pipe live AI telemetry continuously without getting bottlenecked.

### OpenCV (cv2) & NumPy
- **Why it was used:** Used inside the AI service to procedurally generate synthetic 4D camera frames and process arithmetic. OpenCV rapidly encodes numpy matrices into Base64 buffers directly for the web wrapper.

---

## 5. Infrastructure & Deployment 🛠️

### Docker & GNU Make
- **Why it was used:** Docker solves the "it works on my machine" problem by sandboxing the AI, Web, and Frontend applications. The `Makefile` acts as a developer command hub, allowing devs to boot the entire multi-service stack with a simple `make up`.
