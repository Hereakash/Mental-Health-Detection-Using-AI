# 🚀 Quick Start Guide - Mental Health Detection Using AI

This guide will help you get the application up and running in under 5 minutes!

## Prerequisites

- Python 3.8 or higher installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Hereakash/Mental-Health-Detection-Using-AI.git
cd Mental-Health-Detection-Using-AI
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Gemini API Key

**Option A - Quick Setup (Development Only):**

```bash
# On Linux/Mac:
export GEMINI_API_KEY="your-api-key-here"

# On Windows:
set GEMINI_API_KEY=your-api-key-here
```

**Option B - Using .env File (Recommended):**

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your API key
nano .env  # or use any text editor
```

In the `.env` file:
```
GEMINI_API_KEY=your-actual-api-key-here
```

### 5. Start the Backend Server

```bash
python app.py
```

You should see:
```
* Running on http://0.0.0.0:5000
```

### 6. Open the Frontend

Open a new terminal (keep the backend running):

```bash
# Navigate to project root
cd ..  # If you're in backend/

# Start a simple HTTP server
python3 -m http.server 8000
```

### 7. Access the Application

Open your browser and go to:
```
http://localhost:8000
```

## Verify Everything Works

### Test 1: Check Backend
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"healthy","message":"Mental Health Detection API is running"}
```

### Test 2: Check Gemini API Status
```bash
curl http://localhost:5000/api/chat/status
```

Expected response:
```json
{
  "gemini_available": true,
  "api_key_configured": true,
  "using_ai": true,
  "model": "gemini-1.5-flash"
}
```

### Test 3: Send a Test Chat Message
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

## 🎉 You're All Set!

Now you can:
1. **Use the AI Chatbot** - Click "Start Chatting" on the homepage
2. **Take Assessments** - Try the PHQ-9 or GAD-7 questionnaires
3. **Analyze Text** - Share your feelings for NLP analysis
4. **Use Facial Detection** - Enable webcam for emotion recognition

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'google'"

**Solution:**
```bash
pip install google-generativeai
```

### Issue: "Gemini API not working"

**Solution:** Check if your API key is set:
```bash
python -c "import os; print('API Key set:', bool(os.environ.get('GEMINI_API_KEY')))"
```

### Issue: "Port 5000 already in use"

**Solution:** Stop the process using port 5000 or use a different port:
```bash
python app.py  # Change port in app.py to 5001
```

### Issue: "CORS errors in browser"

**Solution:** Make sure you're accessing via `http://localhost:8000` and not opening the HTML file directly.

## Need More Help?

- 📖 Full documentation: [README.md](README.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/Hereakash/Mental-Health-Detection-Using-AI/issues)
- 💬 Ask questions: [GitHub Discussions](https://github.com/Hereakash/Mental-Health-Detection-Using-AI/discussions)

## Next Steps

- Read the [full README](README.md) for detailed API documentation
- Check out [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions
- Explore the [API endpoints](README.md#-api-documentation)
- Learn about [training custom ML models](docs/MODEL_TRAINING.md)

---

**Happy exploring! Remember: Your mental health matters. 💙**
