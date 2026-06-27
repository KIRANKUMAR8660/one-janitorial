# Production Deployment Blueprint: One Janitorial Platform

This manual details the step-by-step guides for shipping the One Janitorial Enterprise Staff Platform to production hosting environments.

---

## 1. Cloud-Based Platform Deployments

### A. Frontend: Vercel Hosting
The React SPA client utilizes the [vercel.json](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/frontend/vercel.json) rules to manage SPA URL rewrites and strict CSP headers.
1. Sign in to your [Vercel Console](https://vercel.com).
2. Click **Add New Project** and connect the repository.
3. Set the project configuration parameters:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the frontend environment variable:
   - `VITE_API_URL` (optional: defaults to proxied origin `/api` if Vercel routes are mapped).
5. Deploy.

### B. Backend: Render Web Service & Worker
The Node.js Express server is deployed using [render.yaml](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/render.yaml).
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **Blueprints** and upload the root `render.yaml`.
3. Provide database connection parameters in the config prompt:
   - `MONGO_URI`
   - `VAULT_ENCRYPTION_KEY`
4. Click **Apply App Stack**. Render compiles and boots the Web service and BullMQ worker.

---

## 2. Docker & Containerized Infrastructure
The platform features multi-service orchestration out-of-the-box using the root [docker-compose.yml](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/docker-compose.yml) and Nginx reverse proxy configuration.

### A. Environment Checklists
Ensure ports `80`, `443`, `3000`, `5000`, `9090` (Prometheus) and `27017` are open and not conflicting with active processes on the host.

### B. Starting services
From the workspace root directory, run:
```bash
docker-compose up -d --build
```
This boots 5 services:
- `backend-api` (Port 5000)
- `frontend-client` (Port 3000)
- `nginx` (Ports 80/443 - routes traffic dynamically)
- `prometheus` (Port 9090 - records performance gauges)
- `mongodb` (Port 27017 - persistence storage)

---

## 3. Host-Level Deployment: PM2 & Node.js
To run the services directly on a virtual machine (Ubuntu, Debian, Windows Server):

### A. Install PM2
```bash
npm install -g pm2
```

### B. Booting backend services
Use the backend ecosystem layout to manage daemon clustering:
```bash
cd backend
pm2 start ecosystem.config.json --env production
```

### C. Booting frontend static assets
Use Nginx or http-server to serve Vite `dist/` production assets:
```bash
cd frontend
npm install
npm run build
pm2 start npx --name "frontend-client" -- http-server dist -p 3000 --proxy http://localhost:5000
```

---

## 4. Telemetry, Monitoring & Diagnostics
- **Express Health Checker Port**: `http://localhost:5000/health` (Returns JSON `status: OK` and timestamp).
- **Self-Healing Portal Daemon**: Checks memory consumption levels at `http://localhost:5000/api/advanced/self-healing/status`.
- **System Telemetry Logs**: Audit entries are stored dynamically in the Express root logs (`/backend/temp_emails.log` or Winston system streams).
