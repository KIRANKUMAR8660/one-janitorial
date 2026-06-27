# One Janitorial: Enterprise Staff Operations Platform

One Janitorial is an enterprise-grade operational coordination and security platform managing ticket checksheets, CRM deal allocations, automated n8n-style workflow DAG diagrams, voice briefing transcripts, dynamic API gateway generators, and secure credentials storage.

---

## 1. Directory Structure

```
one__janitorial/
├── backend/               # Express.js API & Socket.io Web Server
│   ├── src/
│   │   ├── config/        # Database & telemetry logger
│   │   ├── controllers/   # Route controllers (API, custom endpoints, workflows)
│   │   ├── middleware/    # Auth verification, rate limiters, error captures
│   │   ├── models/        # 40+ Mongoose operational schemas
│   │   └── routes/        # Router bindings
│   └── scripts/           # Integration tests & database backup scripts
├── frontend/              # React.js Vite Client Application
│   ├── src/
│   │   ├── components/    # Reusable enterprise UI tables & page frames
│   │   ├── pages/         # 30+ operational dashboard views
│   │   └── store/         # Redux Toolkit global state maps
│   └── vercel.json        # Single Page Application Vercel rewrite maps
├── nginx/                 # Reverse proxy server block configs
├── prometheus/            # Metric gauges targets
└── render.yaml            # Blueprint stack configuration for Render.com
```

---

## 2. Main Capabilities

- **Module 1: Real-time Communication**: Slack-grade chat rooms featuring client-side browser recording, real-time voice speech-to-text transcribing, drag-and-drop file sharing, typing states, and read receipts.
- **Module 2: Meeting Center**: Integrated GMeet/Teams schedules scheduler, Notes taking board, and database attendance trackers.
- **Module 3: Custom API Builder**: Admin endpoint generator mapping HTTP routes dynamically to node DAG workflows, checking rate limits, and outputting swagger documentation.
- **Module 4: User Administration**: Account locks tracking, credentials generation (email/temporary passwords), and MFA device pairing.

---

## 3. Quickstart Guide (Local Environment)

### A. Prerequisites
- **Node.js** v20+
- **MongoDB** running locally on port `27017`

### B. Setup & Execution
1. Clone the repository and initialize backend configuration:
   ```bash
   cd backend
   npm install
   # Copy sample credentials to .env
   cp .env.example .env
   ```
2. Start the backend Node server:
   ```bash
   npm run dev
   ```
3. Initialize and boot the frontend React app:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
4. Access the portal at **[http://localhost:3000/](http://localhost:3000/)**. Use default developer credentials to sign in:
   - **Email**: `admin@onejanitorial.com`
   - **Password**: `Password123`

---

## 4. Production Release Mappings
- Detailed instructions for PM2 clustering, Nginx server setups, and Docker Compose configurations are documented in [DEPLOYMENT.md](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/DEPLOYMENT.md).
- Complete descriptions of variables schemas are listed in [ENVIRONMENT_SETUP.md](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/ENVIRONMENT_SETUP.md).
- Version milestones details can be checked in [CHANGELOG.md](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/CHANGELOG.md).
