# Deployment Guide

This guide will help you deploy the Mental Health Detection AI application to production.

## Architecture

This application consists of two parts:
1. **Frontend**: Static HTML/CSS/JavaScript (can be deployed to GitHub Pages, Vercel, or Netlify)
2. **Backend**: Python Flask API (needs to be deployed to a service like Render, Railway, or Heroku)

## Quick Start - GitHub Pages (Recommended for Frontend)

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Click **Save**

### Step 2: Push to Main Branch

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy your site when you push to the `main` branch:

```bash
git checkout main
git merge copilot/fix-deployment-issues
git push origin main
```

Your site will be available at: `https://[username].github.io/Mental-Health-Detection-Using-AI/`

**Note**: The first deployment may take 2-3 minutes. Check the "Actions" tab in your repository to monitor deployment progress.

## Backend Deployment Options

The backend needs to be deployed separately. Here are the recommended options:

### Option 1: Render.com (Recommended - Free Tier Available)

1. **Create account**: Go to [render.com](https://render.com) and sign up
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect repository**: Select your GitHub repository
4. **Configure**:
   - **Name**: `mental-health-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
   - **Instance Type**: Free
5. **Environment Variables** (Optional):
   - `OPENAI_API_KEY`: Your OpenAI API key (for AI chatbot)
6. **Deploy**: Click "Create Web Service"

After deployment, copy your Render URL (e.g., `https://mental-health-backend.onrender.com`)

### Option 2: Railway.app

1. **Create account**: Go to [railway.app](https://railway.app)
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select repository**: Choose your repository
4. **Configure**:
   - Add environment variable `OPENAI_API_KEY` (optional)
5. **Deploy**: Railway will auto-detect Python and deploy

### Option 3: Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create mental-health-backend

# Deploy
git subtree push --prefix backend heroku main
```

## Update Frontend with Backend URL

After deploying the backend, update the API URL in `script.js`:

1. Open `script.js`
2. Find line ~30:
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:5000/api'
       : 'https://mental-health-backend.onrender.com/api'; // Update this URL
   ```
3. Replace `https://mental-health-backend.onrender.com/api` with your actual backend URL
4. Commit and push:
   ```bash
   git add script.js
   git commit -m "Update backend API URL"
   git push origin main
   ```

## Alternative: Vercel Deployment (Frontend)

If you prefer Vercel over GitHub Pages:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts**:
   - Link to existing project or create new
   - Select root directory
   - Deploy

Your site will be available at: `https://[project-name].vercel.app`

## Alternative: Netlify Deployment (Frontend)

1. **Create account**: Go to [netlify.com](https://netlify.com)
2. **New site**: Click "Add new site" → "Import an existing project"
3. **Connect to Git**: Select GitHub and authorize
4. **Select repository**: Choose your repository
5. **Deploy settings**:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `/` (root)
6. **Deploy site**: Click "Deploy"

Your site will be available at: `https://[site-name].netlify.app`

## Testing the Deployment

1. **Test Frontend**:
   - Visit your deployed URL
   - Check that all pages load correctly
   - Verify that the facial detection works (requires HTTPS)
   - Test the questionnaire feature (works without backend)

2. **Test Backend Connection**:
   - Open browser console (F12)
   - Try using the chatbot feature
   - Check for any CORS or connection errors
   - Verify API calls are going to your backend URL

## Troubleshooting

### Frontend Issues

**Problem**: Site shows 404 or doesn't load
- **Solution**: Check GitHub Pages settings, ensure `main` branch is selected
- Wait 2-3 minutes for deployment to complete
- Check "Actions" tab for deployment status

**Problem**: Facial detection doesn't work
- **Solution**: Ensure site is served over HTTPS (GitHub Pages automatically uses HTTPS)
- Camera access requires secure context (HTTPS or localhost)

### Backend Issues

**Problem**: CORS errors in browser console
- **Solution**: Verify CORS is properly configured in `backend/app.py`
- Check that your frontend URL is in the allowed origins list
- Try adding wildcard pattern if needed: `"*"`

**Problem**: Backend won't start
- **Solution**: Check deployment logs in your hosting service
- Verify all dependencies in `requirements.txt` are installed
- Ensure `gunicorn` is in requirements.txt

**Problem**: Database errors
- **Solution**: The SQLite database will be created automatically
- On some platforms, you may need to use PostgreSQL instead
- Add `DATABASE_URL` environment variable if needed

### API Connection Issues

**Problem**: "Failed to fetch" errors
- **Solution**: 
  1. Check backend is running and accessible
  2. Verify API URL in `script.js` is correct
  3. Test backend directly: `curl https://your-backend.com/api/health`
  4. Check browser console for specific error messages

**Problem**: OpenAI chatbot not working
- **Solution**: 
  - The app falls back to rule-based responses without API key
  - Set `OPENAI_API_KEY` environment variable in backend hosting service
  - Verify API key is valid and has credits

## Environment Variables

### Backend Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | No | OpenAI API key for AI chatbot | `sk-...` |
| `OPENAI_MODEL` | No | Model to use (default: gpt-3.5-turbo) | `gpt-4` |
| `FLASK_DEBUG` | No | Enable debug mode | `false` |
| `DATABASE_URL` | No | Database connection string | Auto-created SQLite |
| `PORT` | No | Port to run on (auto-set by host) | `5000` |

## Monitoring

### Check Deployment Status

**GitHub Pages**:
- Go to repository → Actions tab
- Check workflow runs
- Green checkmark = successful deployment

**Render/Railway**:
- Check service logs in dashboard
- Monitor for errors or crashes
- View deployment history

### Health Check

Test your backend is running:
```bash
curl https://your-backend-url.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Mental Health Detection API is running"
}
```

## Security Best Practices

1. **Never commit secrets**: Keep API keys in environment variables
2. **Use HTTPS**: Always deploy frontend on HTTPS
3. **Validate CORS**: Only allow specific origins in production
4. **Rate limiting**: Consider adding rate limiting to backend
5. **Input validation**: Backend validates all user inputs

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs in your hosting platform
3. Check browser console for frontend errors
4. Test backend health endpoint
5. Verify all configuration files are correct

## Quick Reference

**Frontend URLs**:
- GitHub Pages: `https://[username].github.io/[repo-name]/`
- Vercel: `https://[project-name].vercel.app`
- Netlify: `https://[site-name].netlify.app`

**Backend URLs**:
- Render: `https://[app-name].onrender.com`
- Railway: `https://[app-name].up.railway.app`
- Heroku: `https://[app-name].herokuapp.com`

**Important Files**:
- Frontend config: `script.js` (line ~30 for API_BASE_URL)
- Backend config: `backend/app.py` (CORS settings)
- GitHub Actions: `.github/workflows/deploy.yml`
- Vercel config: `vercel.json`
