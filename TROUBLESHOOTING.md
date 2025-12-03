# 🔧 Troubleshooting Guide - Mental Health Detection Using AI

This guide helps you resolve common issues you might encounter while setting up or using the application.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Google Gemini API Issues](#google-gemini-api-issues)
3. [Backend Server Issues](#backend-server-issues)
4. [Frontend Issues](#frontend-issues)
5. [Database Issues](#database-issues)
6. [Facial Detection Issues](#facial-detection-issues)
7. [Performance Issues](#performance-issues)

---

## Installation Issues

### Issue: Python Version Incompatibility

**Symptoms:**
```
ERROR: This package requires Python 3.8 or higher
```

**Solution:**
1. Check your Python version:
   ```bash
   python --version
   # or
   python3 --version
   ```

2. If version is below 3.8, upgrade Python:
   - **Ubuntu/Debian:**
     ```bash
     sudo apt update
     sudo apt install python3.10
     ```
   - **macOS (using Homebrew):**
     ```bash
     brew install python@3.10
     ```
   - **Windows:** Download from [python.org](https://www.python.org/downloads/)

3. Use the correct Python version:
   ```bash
   python3.10 -m venv venv
   ```

### Issue: pip Install Fails

**Symptoms:**
```
ERROR: Could not install packages due to an EnvironmentError
```

**Solutions:**

1. **Upgrade pip:**
   ```bash
   pip install --upgrade pip
   ```

2. **Use --user flag:**
   ```bash
   pip install --user -r requirements.txt
   ```

3. **Fix permissions (Linux/Mac):**
   ```bash
   sudo pip install -r requirements.txt
   # Or better, use virtual environment
   ```

4. **Clear pip cache:**
   ```bash
   pip cache purge
   pip install -r requirements.txt
   ```

### Issue: Virtual Environment Not Activating

**Windows PowerShell:**
```powershell
# If you get execution policy error
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
# Make sure script is executable
chmod +x venv/bin/activate
source venv/bin/activate
```

---

## Google Gemini API Issues

### Issue: "gemini_available: false" or "using_ai: false"

**Symptoms:**
```json
{
  "gemini_available": false,
  "api_key_configured": false,
  "using_ai": false,
  "model": "rule-based"
}
```

**Solutions:**

1. **Install google-generativeai package:**
   ```bash
   pip install google-generativeai
   ```

2. **Verify installation:**
   ```bash
   python -c "import google.generativeai as genai; print('Success!')"
   ```

3. **Check if package is in requirements.txt:**
   ```bash
   grep "google-generativeai" backend/requirements.txt
   ```
   If not present, add it:
   ```bash
   echo "google-generativeai>=0.3.0" >> backend/requirements.txt
   pip install -r backend/requirements.txt
   ```

### Issue: API Key Not Recognized

**Symptoms:**
- Chatbot uses rule-based responses only
- `api_key_configured: false` in status

**Solutions:**

1. **Verify API key is set:**
   ```bash
   # Linux/Mac
   echo $GEMINI_API_KEY
   
   # Windows CMD
   echo %GEMINI_API_KEY%
   
   # Windows PowerShell
   echo $env:GEMINI_API_KEY
   ```

2. **Set API key in current session:**
   ```bash
   # Linux/Mac
   export GEMINI_API_KEY="your-key-here"
   
   # Windows CMD
   set GEMINI_API_KEY=your-key-here
   
   # Windows PowerShell
   $env:GEMINI_API_KEY="your-key-here"
   ```

3. **Use .env file (recommended):**
   ```bash
   cd backend
   cp .env.example .env
   nano .env  # Edit and add your API key
   ```

4. **Verify python-dotenv is installed:**
   ```bash
   pip install python-dotenv
   ```

5. **Restart the backend server after setting the API key**

### Issue: API Rate Limiting

**Symptoms:**
```
Error: 429 Too Many Requests
```

**Solutions:**

1. **Check your API quota** at [Google AI Studio](https://makersuite.google.com/)

2. **Implement request throttling:**
   - Add delays between requests
   - Cache responses when possible

3. **Upgrade your API tier** if available

4. **Use fallback mode** (rule-based responses) during high traffic

### Issue: API Key Invalid

**Symptoms:**
```
Error: Invalid API key
```

**Solutions:**

1. **Generate a new API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Replace the old key in your environment

2. **Check for whitespace:**
   ```bash
   # Trim any whitespace from API key
   export GEMINI_API_KEY=$(echo "your-key" | tr -d ' ')
   ```

3. **Verify API key format:**
   - Should start with "AIza"
   - Should be 39 characters long

### Issue: API Model Not Found

**Symptoms:**
```
Error: Model gemini-1.5-flash not found
```

**Solutions:**

1. **Use a valid model name:**
   ```bash
   export GEMINI_MODEL="gemini-pro"
   # or
   export GEMINI_MODEL="gemini-1.5-flash"
   ```

2. **Check available models** in [Google AI documentation](https://ai.google.dev/)

3. **Remove model specification** to use default:
   ```bash
   unset GEMINI_MODEL
   ```

---

## Backend Server Issues

### Issue: Port 5000 Already in Use

**Symptoms:**
```
OSError: [Errno 48] Address already in use
```

**Solutions:**

1. **Find and kill the process:**
   ```bash
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Use a different port:**
   Edit `backend/app.py`:
   ```python
   if __name__ == '__main__':
       app.run(debug=False, host='0.0.0.0', port=5001)
   ```

3. **Use environment variable:**
   ```bash
   export FLASK_RUN_PORT=5001
   flask run
   ```

### Issue: ModuleNotFoundError

**Symptoms:**
```
ModuleNotFoundError: No module named 'flask'
```

**Solutions:**

1. **Activate virtual environment:**
   ```bash
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Verify installation:**
   ```bash
   pip list
   ```

### Issue: Database Connection Error

**Symptoms:**
```
sqlite3.OperationalError: unable to open database file
```

**Solutions:**

1. **Check file permissions:**
   ```bash
   ls -la mental_health.db
   chmod 644 mental_health.db  # Linux/Mac
   ```

2. **Verify database path:**
   ```bash
   python -c "from database import get_db_path; print(get_db_path())"
   ```

3. **Recreate database:**
   ```bash
   rm mental_health.db
   python -c "from database import init_database; init_database()"
   ```

### Issue: CORS Errors

**Symptoms:**
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:8000' has been blocked by CORS policy
```

**Solutions:**

1. **Verify Flask-CORS is installed:**
   ```bash
   pip install flask-cors
   ```

2. **Check CORS configuration in app.py:**
   ```python
   from flask_cors import CORS
   app = Flask(__name__)
   CORS(app)  # This should be present
   ```

3. **Use proper origin:**
   - Access frontend via `http://localhost:8000`, not `file://`
   - Start a local server:
     ```bash
     python -m http.server 8000
     ```

---

## Frontend Issues

### Issue: Face-api.js Not Loading

**Symptoms:**
- "Face detection models failed to load" error
- Facial detection feature not working

**Solutions:**

1. **Check if models directory exists:**
   ```bash
   ls -la models/
   ```

2. **Download face-api.js models:**
   - Download from [face-api.js GitHub](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)
   - Place in `models/` directory

3. **Use CDN fallback:**
   The application automatically falls back to CDN if local files fail

4. **Check browser console for errors:**
   - Open Developer Tools (F12)
   - Check Console tab for error messages

### Issue: Webcam Access Denied

**Symptoms:**
- "Camera access denied" error
- Facial detection not starting

**Solutions:**

1. **Grant webcam permissions in browser:**
   - Click camera icon in address bar
   - Allow camera access
   - Refresh the page

2. **Use HTTPS or localhost:**
   - Browsers restrict camera access on non-secure origins
   - Use `http://localhost:8000` or HTTPS

3. **Check camera in system settings:**
   - Verify camera works in other applications
   - Check if browser has permission in OS settings

4. **Try different browser:**
   - Chrome/Edge usually have best support
   - Firefox and Safari also supported

### Issue: Frontend Not Connecting to Backend

**Symptoms:**
- API calls fail
- "Network error" messages

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check API_BASE_URL in script.js:**
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

3. **Check browser console:**
   - Look for CORS or network errors
   - Verify correct API endpoints

4. **Test with curl:**
   ```bash
   curl -X POST http://localhost:5000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```

---

## Database Issues

### Issue: Database Locked

**Symptoms:**
```
sqlite3.OperationalError: database is locked
```

**Solutions:**

1. **Close other connections:**
   - Stop all running instances of the application
   - Close database browsers/tools

2. **Restart the application:**
   ```bash
   pkill -f "python app.py"
   python app.py
   ```

3. **Increase timeout:**
   Edit `database.py`:
   ```python
   conn = sqlite3.connect(get_db_path(), timeout=30)
   ```

### Issue: Database Schema Out of Date

**Symptoms:**
- SQL errors about missing columns
- "no such table" errors

**Solutions:**

1. **Recreate database:**
   ```bash
   cd backend
   rm mental_health.db
   python -c "from database import init_database; init_database()"
   ```

2. **Run migration (if available):**
   ```bash
   python migrate.py  # If migration script exists
   ```

---

## Facial Detection Issues

### Issue: Low Frame Rate

**Symptoms:**
- Facial detection is slow/laggy
- High CPU usage

**Solutions:**

1. **Use smaller face detection model:**
   - Switch to `tiny_face_detector` (already default)
   - Reduce video resolution

2. **Increase detection interval:**
   Edit `script.js`:
   ```javascript
   const DETECTION_INTERVAL = 200; // Increase from 100ms
   ```

3. **Close other applications:**
   - Free up system resources
   - Close unnecessary browser tabs

### Issue: Faces Not Detected

**Symptoms:**
- No face detection boxes appear
- Emotion not recognized

**Solutions:**

1. **Improve lighting:**
   - Ensure face is well-lit
   - Avoid backlighting

2. **Position camera properly:**
   - Face camera directly
   - Keep face in frame
   - Maintain appropriate distance

3. **Check model loading:**
   - Open browser console
   - Look for model loading errors

4. **Update face-api.js:**
   - Use latest version from CDN
   - Clear browser cache

---

## Performance Issues

### Issue: Slow API Responses

**Symptoms:**
- Long wait times for chatbot responses
- Timeout errors

**Solutions:**

1. **Check internet connection:**
   - Gemini API requires internet
   - Test with: `ping google.com`

2. **Use local model fallback:**
   - Rule-based responses are instantaneous
   - Consider caching frequent responses

3. **Optimize database queries:**
   - Add indexes if needed
   - Limit history size

4. **Use production server:**
   ```bash
   gunicorn -w 4 app:app
   ```

### Issue: High Memory Usage

**Symptoms:**
- System slowdown
- Application crashes

**Solutions:**

1. **Limit chat history:**
   Edit database queries to limit results:
   ```python
   get_chat_history(user_id, limit=50)  # Reduce limit
   ```

2. **Clear old data:**
   ```bash
   python -c "from database import clear_old_data; clear_old_data(days=30)"
   ```

3. **Restart application regularly:**
   - Use process manager (systemd, pm2)
   - Implement automatic restarts

---

## Getting More Help

If your issue isn't covered here:

1. **Check GitHub Issues:**
   - [Existing Issues](https://github.com/Hereakash/Mental-Health-Detection-Using-AI/issues)
   - Search for similar problems

2. **Create a New Issue:**
   - Provide detailed description
   - Include error messages
   - Share system information
   - List steps to reproduce

3. **Read Documentation:**
   - [README.md](README.md)
   - [API Documentation](API_DOCUMENTATION.md)
   - [Quick Start Guide](QUICKSTART.md)

4. **Check Logs:**
   - Backend console output
   - Browser developer console
   - System logs

---

## Debugging Tips

### Enable Debug Mode

**Backend:**
```python
# In app.py
app.run(debug=True)  # Shows detailed errors
```

**Environment:**
```bash
export FLASK_DEBUG=true
export FLASK_ENV=development
```

### Verbose Logging

Add logging to troubleshoot:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Test Components Individually

**Test Database:**
```bash
python -c "from database import init_database; init_database(); print('DB OK')"
```

**Test Gemini API:**
```bash
python -c "from chatbot import MentalHealthChatbot; bot = MentalHealthChatbot(); print(bot.get_api_status())"
```

**Test ML Model:**
```bash
python -c "from ml_model import get_model; model = get_model(); print(model.get_model_info())"
```

---

## Prevention Tips

1. **Use Virtual Environments:** Always isolate dependencies
2. **Keep Dependencies Updated:** Regularly run `pip install --upgrade -r requirements.txt`
3. **Backup Database:** Regularly backup `mental_health.db`
4. **Monitor API Usage:** Track Gemini API quota
5. **Test Before Deploying:** Run tests in development environment first
6. **Use Version Control:** Commit working configurations
7. **Document Changes:** Keep notes on customizations

---

**Remember:** Most issues have simple solutions. Check the basics first (API keys, dependencies, permissions) before diving into complex debugging.

**For urgent issues during development, the rule-based chatbot fallback ensures core functionality always works!**
