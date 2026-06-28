# Implementation Plan: GitHub & Vercel Deployment

This plan details the steps to push the One Janitorial project to GitHub and host the frontend client on Vercel.

## User Review Required

> [!IMPORTANT]
> **Hosting Division:**
> - **Frontend (React/Vite):** Supported and recommended for hosting on Vercel.
> - **Backend (Express, BullMQ, Socket.io):** The backend relies on persistent background processing (BullMQ/Redis) and open WebSocket connections (`socket.io`). Vercel's serverless environment is stateless and has short timeouts, making it **unsuitable** for hosting the backend. The backend should instead be deployed on **Render** (as outlined in [DEPLOYMENT.md](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/DEPLOYMENT.md)), **Railway**, or similar hosting platforms.

> [!IMPORTANT]
> **GitHub Repository Creation:**
> The current configured remote is `https://github.com/KIRANKUMAR8660/.One-Janitorial.git`. Since the repository does not exist on GitHub, you need to create a new empty repository named **`.One-Janitorial`** (or change the name to **`one-janitorial`** / **`one__janitorial`**) on GitHub under your account.

---

## Open Questions

1. **GitHub Repository Name & Credentials:**
   - Do you want to use the repository name `.One-Janitorial` (with the dot)? If you prefer a name without a dot (e.g. `one-janitorial`), we will update the git remote.
   - Have you created this empty repository on GitHub yet? If not, please create it so we can push the code.
2. **Backend Hosting:**
   - Do you want to deploy the backend to **Render** (which is already configured in the repo via [render.yaml](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/render.yaml)) or another provider like Railway?
3. **Vercel Authentication:**
   - Since we cannot access your browser to authenticate Vercel directly, we will either need to trigger the login via CLI and provide you with the login confirmation link, or you can connect your GitHub account directly in the Vercel web console to import the repository. Which approach do you prefer?

---

## Proposed Changes

No changes to the source code are required as the project contains a pre-configured [vercel.json](file:///c:/Users/KIRAN%20KUMAR/Downloads/one__janitorial/frontend/vercel.json) pointing to the Render backend URL.

---

## Verification Plan

### Manual Verification
- Verify successful push to the GitHub repository.
- Run frontend build verification locally to ensure `npm run build` succeeds under the `frontend` folder.
- Initiate Vercel deployment and verify that the routing, asset serving, and rewrite rules function as expected.
