# 🚀 Quick Deployment Guide

This is a **fast-track** guide to get your app deployed in minutes.

## Step 1: Deploy Frontend (2 minutes)

### Option A: GitHub Pages (Recommended)

1. **Go to your repository** on GitHub
2. **Click Settings** (top menu)
3. **Click Pages** (left sidebar)
4. **Under "Build and deployment"**:
   - **Source**: Select "GitHub Actions" (NOT "Deploy from a branch")
5. **Click Save**
6. **Merge this PR to main branch**:
   ```bash
   # Or merge via GitHub UI
   git checkout main
   git merge copilot/fix-deployment-issues
   git push origin main
   ```
7. **Wait 2-3 minutes** for deployment
8. **Visit**: `https://[your-username].github.io/Mental-Health-Detection-Using-AI/`

✅ **Done!** Your frontend is live. The facial detection and questionnaire features work immediately (no backend needed).

## Step 2: Deploy Backend (5 minutes) - Optional

The backend is **optional** but required for:
- AI Chatbot feature
- User profiles and chat history
- ML model predictions

### Option A: Render.com (Free Tier)

1. **Sign up**: Go to [render.com](https://render.com) and create account
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect GitHub**: Select your repository
4. **Configure**:
   - **Root Directory**: Leave empty
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
5. **Create Web Service**: Click the button
6. **Wait 3-5 minutes** for first build
7. **Copy your URL**: e.g., `https://mental-health-backend.onrender.com`

### Option B: Railway.app (Even Easier)

1. **Go to** [railway.app](https://railway.app)
2. **Click "Start a New Project"**
3. **Deploy from GitHub**: Select your repo
4. **Done!** Railway auto-configures everything
5. **Copy your URL** from the dashboard

## Step 3: Connect Frontend to Backend (1 minute)

1. **Open** `script.js` in your repository
2. **Find line ~30** (search for `API_BASE_URL`)
3. **Replace** the URL:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:5000/api'
       : 'https://YOUR-BACKEND-URL.onrender.com/api'; // Change this!
   ```
4. **Save and push**:
   ```bash
   git add script.js
   git commit -m "Update backend URL"
   git push origin main
   ```
5. **Wait 1-2 minutes** for GitHub Pages to redeploy

## Step 4: Test Everything (2 minutes)

1. **Visit your site**: `https://[username].github.io/Mental-Health-Detection-Using-AI/`
2. **Test features**:
   - ✅ Facial Detection (click "Start Facial Check") - **Works immediately**
   - ✅ Questionnaire (click "Take Questionnaire") - **Works immediately**
   - ✅ Text Analysis (click "Analyze Text") - **Requires backend**
   - ✅ AI Chatbot (click "Chat with AI") - **Requires backend**

## Troubleshooting

### Frontend shows 404
- Wait 2-3 minutes for initial deployment
- Check Settings → Pages shows "Your site is live at..."
- Check Actions tab for deployment status (should be green ✓)

### Chatbot doesn't work
- Check browser console (F12) for errors
- Verify backend URL in script.js is correct
- Test backend: `curl https://your-backend.com/api/health`
- If backend is sleeping (free tier), first request wakes it up (30 seconds)

### Facial detection doesn't work
- **Must use HTTPS** (GitHub Pages uses HTTPS automatically)
- Grant camera permissions in browser
- Works without backend!

## What Works Without Backend?

These features work **immediately** with just frontend deployment:
- ✅ Facial Emotion Detection
- ✅ PHQ-9 & GAD-7 Questionnaires
- ✅ All UI and navigation
- ✅ Results and recommendations

## Optional: Add OpenAI API Key

For AI-powered chatbot (instead of rule-based):

1. **Get API key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **In Render/Railway**: Go to Environment Variables
3. **Add variable**:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-...` (your key)
4. **Redeploy** backend

## You're Done! 🎉

Your mental health detection app is now live and accessible worldwide!

**Your URLs**:
- Frontend: `https://[username].github.io/Mental-Health-Detection-Using-AI/`
- Backend: `https://[your-app].onrender.com` (or Railway URL)

## Need More Help?

- **Detailed guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Configuration**: See [CONFIG.md](CONFIG.md)
- **Troubleshooting**: See [README.md](README.md#troubleshooting)

---

**Total time**: ~10 minutes (5 minutes if skipping backend)
