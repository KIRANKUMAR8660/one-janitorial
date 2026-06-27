# Changelog: One Janitorial Platform

All notable changes and milestones achieved in this project are documented here.

---

## [1.0.0] - 2026-06-27

### Added
- **Module 1 (Communication)**: Completed browser-native voice recording integration in Chat. Includes real-time `webkitSpeechRecognition` speech-to-text transcribing, audio level canvas visualizer gauges, file drag-and-drop overlays, typing indicators, read receipts, and transcribing database management drawer with text download exports and AI summary options.
- **Module 2 (Meetings)**: Completed Meeting scheduling controls including edit/delete routes, attendance status checks, zoom/Google Meet URL integrations, and automatic AI meeting minutes generators.
- **Module 3 (API Builder)**: Provisioned custom REST endpoints dynamic router catch-all `/api/custom-run/:version/:path(*)` connecting Custom APIs directly to backend DAG workflows, rule parameter validator screens, OpenAPI/Swagger specifications previews, and connection sandbox console loggers.
- **Module 4 (Admin User Registry)**: Created Employee Accounts registry dashboard allowing administrators to generate usernames, unique IDs, and temporary passwords. Integrated secure MFA settings pairing QR Code mockup.

### Configured
- **Vercel**: Added [vercel.json](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/frontend/vercel.json) rules to govern single page routing and secure HTTP headers.
- **Render**: Created [render.yaml](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/render.yaml) mapping Node API web servers and background queue worker tasks.
- **CI/CD**: Added [.github/workflows/deploy.yml](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/.github/workflows/deploy.yml) tracking automated GitHub checkout checks, database connection tests, and Vite build completions.
- **Release Blueprints**: Prepared [DEPLOYMENT.md](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/DEPLOYMENT.md) and [ENVIRONMENT_SETUP.md](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/ENVIRONMENT_SETUP.md) manuals.
- **Backups**: Created automated MongoDB backup scripting utility: `db-backup.js`.
