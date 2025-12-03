# Configuration Template

This file contains configuration values you need to update after deployment.

## Backend API URL

After deploying your backend to Render, Railway, Heroku, or another service:

1. Copy your backend URL (e.g., `https://your-app.onrender.com`)
2. Open `script.js`
3. Find line ~30 (search for `API_BASE_URL`)
4. Replace `https://mental-health-backend.onrender.com/api` with your actual URL
5. Keep `/api` at the end
6. Example: `https://my-mental-health-api.onrender.com/api`

## Example Configuration

```javascript
// In script.js (line ~30)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://YOUR-BACKEND-URL.onrender.com/api'; // <-- Update this
```

## OpenAI API Key (Optional)

For AI-powered chatbot responses:

1. Get an API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. In your backend hosting service (Render, Railway, etc.):
   - Add environment variable: `OPENAI_API_KEY`
   - Set value to your API key: `sk-...`
3. Redeploy the backend

**Note**: The chatbot works without an API key using rule-based responses.

## CORS Configuration (If Needed)

If you deploy to a custom domain, update CORS in `backend/app.py`:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:*",
            "https://*.github.io",
            "https://your-custom-domain.com",  # <-- Add your domain
        ],
        ...
    }
})
```

## Checklist After Deployment

- [ ] Backend deployed and running (test: `curl https://your-backend.com/api/health`)
- [ ] Frontend deployed to GitHub Pages/Vercel/Netlify
- [ ] Updated `API_BASE_URL` in `script.js` with your backend URL
- [ ] Tested frontend loads correctly
- [ ] Tested chatbot feature (optional - requires backend)
- [ ] Added `OPENAI_API_KEY` if using AI chatbot (optional)
- [ ] Verified facial detection works (requires HTTPS)

## Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.
