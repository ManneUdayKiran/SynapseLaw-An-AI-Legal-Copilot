# SynapseLaw Deployment Guide

This guide details how to deploy **SynapseLaw** across popular hosting platforms with zero downtime and fast response times.

---

## Architecture Overview

- **Frontend**: Single Page Application (React 18 + Vite 8 + Material-UI v7)
- **Backend**: Python 3.11 + FastAPI + Uvicorn + SQLite
- **LLM Engine**: Groq Cloud API (`openai/gpt-oss-120b`)

---

## 1. Vercel (Frontend) + Render (Backend) — *Recommended*

### Step 1: Deploy Backend to Render
1. Go to [Render.com](https://render.com) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `synapselaw-api`
   - **Root Directory**: `lexiguide/backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   | Variable | Value |
   |---|---|
   | `APP_ENV` | `production` |
   | `SECRET_KEY` | *(Generate a 32+ character random string)* |
   | `DATABASE_URL` | `sqlite:///./lexiguide.db` |
   | `LLM_PROVIDER` | `groq` |
   | `LLM_MODEL` | `openai/gpt-oss-120b` |
   | `LLM_BASE_URL` | `https://api.groq.com/openai/v1` |
   | `LLM_API_KEY` | `gsk_your_groq_api_key_here` |
   | `CORS_ORIGINS` | `https://your-frontend.vercel.app,http://localhost:5173` |
5. Click **Create Web Service**. Note your backend URL (e.g., `https://synapselaw-api.onrender.com`).

---

### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New...** $\rightarrow$ **Project**.
2. Import your GitHub repository.
3. In project settings:
   - **Root Directory**: `lexiguide/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_BASE_URL` = `https://synapselaw-api.onrender.com` (your Render backend URL)
5. Click **Deploy**.

---

## 2. 1-Click Render Blueprint (`render.yaml`)

If you want Render to set up both Frontend and Backend automatically:
1. Go to [Render Dashboard](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Select your repository. Render will automatically read `render.yaml` and configure both services with automatic inter-service linking.

---

## 3. Railway.app Deployment

1. Go to [Railway.app](https://railway.app) $\rightarrow$ **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Railway detects the monorepo:
   - **Backend Service**: Set Root Directory to `lexiguide/backend`. Railway will use `Procfile` and `requirements.txt`.
   - **Frontend Service**: Set Root Directory to `lexiguide/frontend`. Add variable `VITE_API_BASE_URL = https://${{ backend.RAILWAY_PUBLIC_DOMAIN }}`.
3. Add the environment variables from the table above to the Backend service.

---

## 4. Docker Deployment (Local / VPS / AWS / GCP)

Run the full production stack locally or on a VPS with Docker Compose:

```bash
cd lexiguide
docker compose up -d --build
```
- Frontend will be available at: `http://localhost`
- Backend API will be available at: `http://localhost:8000`
