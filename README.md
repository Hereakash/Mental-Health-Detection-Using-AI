# 🧠 Mental Health Detection Using AI

<div align="center">

![Mental Health AI](https://img.shields.io/badge/Mental%20Health-AI%20Powered-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![Flask](https://img.shields.io/badge/Flask-2.3+-red)
![Gemini API](https://img.shields.io/badge/Google-Gemini%20API-yellow)
![License](https://img.shields.io/badge/License-MIT-purple)

**An AI-powered mental health detection and support system using Google Gemini API, NLP, Machine Learning, and Facial Expression Recognition**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Google Gemini API Configuration](#-google-gemini-api-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Machine Learning Models](#-machine-learning-models)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Credits](#-credits)

---

## 🌟 Overview

**MindfulAI** is a comprehensive mental health detection and early intervention system that leverages artificial intelligence to provide personalized mental wellness assessments. The system integrates multiple assessment methods including:

- **AI-Powered Chatbot**: Conversational support using Google Gemini API
- **Validated Questionnaires**: PHQ-9 (depression) and GAD-7 (anxiety) assessments
- **NLP Text Analysis**: Sentiment analysis and mental health indicator detection
- **Facial Expression Recognition**: Real-time emotion detection using face-api.js

The goal is to help individuals identify early signs of mental health concerns and provide evidence-based coping strategies and professional resource recommendations.

---

## ✨ Features

### 🤖 AI Chatbot (Google Gemini Integration)
- **Empathetic Conversations**: AI-powered chatbot using Google Gemini API for compassionate, context-aware responses
- **Fallback System**: Rule-based responses when API is unavailable
- **Emotion Detection**: Identifies emotions (anxiety, depression, stress) from conversations
- **Risk Assessment**: Automatic risk level evaluation (low, moderate, high)
- **Crisis Detection**: Immediate crisis intervention resources for high-risk situations
- **Chat History**: Persistent conversation tracking and analysis

### 📊 Mental Health Assessments
- **PHQ-9 Depression Scale**: Standardized 9-item depression questionnaire
- **GAD-7 Anxiety Scale**: Validated 7-item generalized anxiety disorder assessment
- **Text Analysis**: NLP-based sentiment and mental health indicator detection
- **Combined Analysis**: Multi-modal assessment combining questionnaire, text, and facial data
- **Personalized Recommendations**: Evidence-based coping strategies and resources

### 🎭 Facial Expression Recognition
- **Real-time Detection**: Webcam-based facial emotion recognition
- **Emotion Tracking**: Continuous monitoring and emotion history
- **Face-api.js Integration**: Client-side processing for privacy

### 📈 Machine Learning
- **Custom ML Models**: Scikit-learn based risk prediction models
- **Multiple Algorithms**: Support for Logistic Regression, Random Forest, Gradient Boosting
- **Model Training**: Capability to train on custom datasets
- **Persistent Storage**: Trained models saved with joblib

### 💾 User Management & Data Persistence
- **SQLite Database**: Local data storage for users, chats, and assessments
- **User Profiles**: Personalized experiences with user tracking
- **Assessment History**: Track mental health journey over time
- **Comprehensive Reports**: Generate detailed mental health reports

### 🔒 Privacy & Security
- **Local Processing**: Facial detection runs entirely in browser
- **Secure API Usage**: Environment-based API key management
- **Data Encryption**: SQLite database with proper access controls
- **No External Data Sharing**: User data remains on local server

---

## 🛠 Tech Stack

### Backend
- **Python 3.8+**: Core programming language
- **Flask 2.3+**: Web framework and REST API
- **Google Generative AI (Gemini)**: AI chatbot capabilities
- **Scikit-learn**: Machine learning models
- **SQLite3**: Database for persistence
- **Pandas & NumPy**: Data manipulation
- **Joblib**: Model serialization

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Styling with modern features
- **JavaScript (ES6+)**: Interactive functionality
- **Face-api.js**: Facial expression recognition
- **Font Awesome**: Icons

### APIs & Libraries
- **Google Gemini API**: AI-powered conversational responses
- **Flask-CORS**: Cross-origin resource sharing
- **Gunicorn**: Production WSGI server

---

## 🏗 Project Architecture

```
┌─────────────────┐
│   Frontend      │
│  (HTML/CSS/JS)  │
│  Face-api.js    │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐       ┌──────────────┐
│  Flask Backend  │◄─────►│ Google       │
│                 │       │ Gemini API   │
│  - Chatbot      │       └──────────────┘
│  - ML Models    │
│  - NLP Analysis │       ┌──────────────┐
│  - User Mgmt    │◄─────►│   SQLite     │
│                 │       │   Database   │
└─────────────────┘       └──────────────┘
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8 or higher**
- **pip** (Python package manager)
- **Git**
- **A modern web browser** (Chrome, Firefox, Edge, Safari)
- **Webcam** (optional, for facial detection feature)
- **Google Gemini API Key** (for AI chatbot functionality)

---

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/Hereakash/Mental-Health-Detection-Using-AI.git
cd Mental-Health-Detection-Using-AI
```

### Backend Setup

1. **Create a Python Virtual Environment** (Recommended)

```bash
# On Linux/Mac
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

2. **Install Backend Dependencies**

```bash
cd backend
pip install -r requirements.txt
```

3. **Install Google Generative AI Package**

The Gemini API package needs to be installed separately:

```bash
pip install google-generativeai
```

4. **Initialize the Database**

The database will be automatically initialized when you first run the application, but you can manually initialize it:

```bash
python -c "from database import init_database; init_database()"
```

5. **Configure Environment Variables** (See [Google Gemini API Configuration](#-google-gemini-api-configuration))

### Frontend Setup

The frontend is a static web application and requires no build step. Simply ensure all files are in place:

```bash
# From the project root directory
ls -la index.html script.js style.css
ls -la assets/
ls -la models/
```

**Note**: The facial detection models should be in the `models/` directory. If missing, face-api.js will attempt to load them from a CDN.

---

## 🔑 Google Gemini API Configuration

### Obtaining a Gemini API Key

1. **Visit Google AI Studio**: Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign in** with your Google account

3. **Create API Key**: Click "Create API Key" and select a Google Cloud project (or create a new one)

4. **Copy Your API Key**: Save this key securely

### Configuration Methods

#### Method 1: Environment Variable (Recommended for Production)

**On Linux/Mac:**
```bash
export GEMINI_API_KEY="your-api-key-here"
export GEMINI_MODEL="gemini-1.5-flash"  # Optional, defaults to gemini-1.5-flash
```

**On Windows (Command Prompt):**
```cmd
set GEMINI_API_KEY=your-api-key-here
set GEMINI_MODEL=gemini-1.5-flash
```

**On Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your-api-key-here"
$env:GEMINI_MODEL="gemini-1.5-flash"
```

#### Method 2: .env File (Recommended for Development)

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-flash
```

Then install python-dotenv:
```bash
pip install python-dotenv
```

And add this to the top of `backend/chatbot.py`:
```python
from dotenv import load_dotenv
load_dotenv()
```

#### Method 3: Direct Code Configuration (Not Recommended for Production)

**⚠️ Security Warning**: Never commit API keys to version control!

Currently, the API key is hardcoded in `backend/chatbot.py` line 333:
```python
GEMINI_API_KEY = "API_KEY"
```

**For production use**, replace this with:
```python
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
```

### Verifying Gemini API Configuration

Test your API configuration:

```bash
cd backend
python -c "from chatbot import MentalHealthChatbot; bot = MentalHealthChatbot(); print(bot.get_api_status())"
```

Expected output:
```json
{
  "gemini_available": true,
  "api_key_configured": true,
  "using_ai": true,
  "model": "gemini-1.5-flash"
}
```

### Fallback Behavior

If the Gemini API is unavailable or the API key is not configured:
- The chatbot automatically falls back to **rule-based responses**
- Basic mental health support is still provided using pattern matching
- No AI features, but core functionality remains operational

---

## 💻 Usage

### Starting the Backend Server

```bash
cd backend
python app.py
```

The Flask server will start at `http://localhost:5000`

**For production deployment:**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Accessing the Application

1. Open your web browser
2. Navigate to the `index.html` file:
   - **Method 1**: Open directly: `file:///path/to/Mental-Health-Detection-Using-AI/index.html`
   - **Method 2**: Use a local web server:
     ```bash
     # Using Python's built-in server
     python -m http.server 8000
     # Then visit: http://localhost:8000
     ```

3. **Select an assessment method** from the landing page:
   - **AI Chatbot**: Conversational mental health support
   - **Questionnaire**: PHQ-9 and GAD-7 assessments
   - **Text Analysis**: NLP-based sentiment analysis
   - **Facial Detection**: Webcam-based emotion recognition

### Using the AI Chatbot

1. Click "Start Chatting" on the landing page
2. Enter your name and optional details (email, age)
3. Start conversing with the AI:
   - Share your feelings and concerns
   - Receive empathetic, AI-powered responses
   - Get personalized coping strategies
   - Access crisis resources if needed
4. Generate a comprehensive report of your session

### Using Other Features

**Questionnaires:**
- Answer PHQ-9 and GAD-7 questions
- Receive instant risk assessment
- Get personalized recommendations

**Text Analysis:**
- Write about your feelings (minimum 50 words)
- Get NLP-based sentiment analysis
- Identify mental health indicators

**Facial Detection:**
- Allow webcam access
- Real-time emotion recognition
- Track emotional patterns

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```
Returns API status.

#### Chatbot

**Send Message**
```http
POST /api/chat
Content-Type: application/json

{
  "user_id": 1,
  "message": "I'm feeling anxious today"
}
```

**Response:**
```json
{
  "response": "I hear that you're experiencing anxiety...",
  "emotions": ["anxious"],
  "topics": ["health"],
  "risk_level": "moderate",
  "using_ai": true
}
```

**Get Chat History**
```http
GET /api/chat/history/{user_id}?limit=50
```

**Get Chat Analysis**
```http
GET /api/chat/analysis/{user_id}
```

**Check Chatbot Status**
```http
GET /api/chat/status
```

Returns:
```json
{
  "gemini_available": true,
  "api_key_configured": true,
  "using_ai": true,
  "model": "gemini-1.5-flash"
}
```

#### User Management

**Create User**
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25
}
```

**Get User**
```http
GET /api/users/{user_id}
```

**List All Users**
```http
GET /api/users
```

#### Assessments

**Analyze Questionnaire**
```http
POST /api/analyze/questionnaire
Content-Type: application/json

{
  "responses": {
    "phq9": [0, 1, 2, 3, 0, 1, 2, 1, 0],
    "gad7": [0, 1, 2, 3, 0, 1, 2]
  }
}
```

**Analyze Text**
```http
POST /api/analyze/text
Content-Type: application/json

{
  "text": "I've been feeling really down lately..."
}
```

**Combined Analysis**
```http
POST /api/analyze/combined
Content-Type: application/json

{
  "responses": { "phq9": [...], "gad7": [...] },
  "text": "...",
  "facial_emotion": "sad"
}
```

**Get Recommendations**
```http
POST /api/recommendations
Content-Type: application/json

{
  "risk_level": "moderate",
  "conditions": ["depression", "anxiety"]
}
```

#### Machine Learning

**Train Model**
```http
POST /api/model/train
Content-Type: application/json

{
  "model_type": "logistic_regression",
  "texts": ["sample text 1", ...],
  "labels": ["low", "moderate", ...]
}
```

**Predict from Text**
```http
POST /api/model/predict
Content-Type: application/json

{
  "text": "I feel overwhelmed with everything"
}
```

**Get Model Info**
```http
GET /api/model/info
```

#### Reports

**Generate User Report**
```http
GET /api/report/{user_id}
```

Returns comprehensive mental health report including:
- User profile
- Conversation summary
- Detected emotions and topics
- Risk assessment
- Personalized recommendations
- Recent assessment history

---

## 📁 Project Structure

```
Mental-Health-Detection-Using-AI/
│
├── backend/                      # Backend application
│   ├── app.py                   # Main Flask application
│   ├── chatbot.py               # Google Gemini AI chatbot
│   ├── mental_health_predictor.py  # Questionnaire scoring
│   ├── text_analyzer.py         # NLP text analysis
│   ├── ml_model.py              # Machine learning models
│   ├── database.py              # SQLite database operations
│   ├── train_model.py           # ML model training script
│   ├── examples_training.py     # Training data examples
│   └── requirements.txt         # Python dependencies
│
├── assets/                      # Static assets
│   ├── images/                  # Images and illustrations
│   └── js/                      # JavaScript libraries
│       └── face-api.min.js      # Facial recognition library
│
├── models/                      # Face-api.js models
│   ├── face_expression_model-*
│   ├── face_landmark_68_model-*
│   ├── face_recognition_model-*
│   └── tiny_face_detector_model-*
│
├── datasets/                    # Training datasets
│   └── README.md
│
├── docs/                        # Additional documentation
│   ├── MODEL_TRAINING.md
│   ├── OFFLINE_SETUP.md
│   └── QUICK_START.md
│
├── index.html                   # Main HTML file
├── script.js                    # Frontend JavaScript
├── style.css                    # Styling
├── verify-setup.sh              # Setup verification script
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Google Gemini API Configuration
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-flash

# Flask Configuration
FLASK_DEBUG=false
FLASK_ENV=production

# Database Configuration
DATABASE_PATH=mental_health.db

# Model Configuration
MODEL_DIR=models
```

**Important**: Add `.env` to your `.gitignore` to prevent committing sensitive data:
```bash
echo ".env" >> .gitignore
```

---

## 🗄 Database Schema

The application uses SQLite with the following schema:

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,              -- 'user' or 'bot'
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sentiment TEXT,                  -- risk level detected
    emotions TEXT,                   -- JSON array of emotions
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Assessments Table
```sql
CREATE TABLE assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    assessment_type TEXT NOT NULL,   -- 'questionnaire', 'text', 'combined'
    scores TEXT,                     -- JSON object of scores
    risk_level TEXT,                 -- 'low', 'moderate', 'high'
    conditions TEXT,                 -- JSON array of detected conditions
    recommendations TEXT,            -- JSON array of recommendations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Chat Analysis Table
```sql
CREATE TABLE chat_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message_count INTEGER DEFAULT 0,
    detected_emotions TEXT,          -- JSON array
    topics TEXT,                     -- JSON array
    overall_sentiment TEXT,          -- 'positive', 'negative', 'neutral'
    risk_level TEXT,                 -- 'low', 'moderate', 'high'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

---

## 🤖 Machine Learning Models

### Supported Algorithms

1. **Logistic Regression** (Default)
   - Fast training and prediction
   - Interpretable coefficients
   - Good for binary and multiclass classification

2. **Random Forest**
   - Ensemble learning method
   - Handles non-linear relationships
   - Feature importance analysis

3. **Gradient Boosting**
   - High accuracy
   - Robust to overfitting
   - Slower training time

### Training a Model

```bash
cd backend
python train_model.py
```

Or via API:
```bash
curl -X POST http://localhost:5000/api/model/train \
  -H "Content-Type: application/json" \
  -d '{"model_type": "logistic_regression"}'
```

### Model Persistence

Trained models are saved in `backend/models/`:
- `mental_health_model.joblib`: Trained classifier
- `vectorizer.joblib`: TF-IDF vectorizer

---

## 🐛 Troubleshooting

### Issue: Gemini API Not Working

**Symptoms**: Chatbot only provides rule-based responses

**Solutions**:
1. Verify API key is set correctly:
   ```bash
   python -c "import os; print(os.environ.get('GEMINI_API_KEY'))"
   ```

2. Check API status:
   ```bash
   curl http://localhost:5000/api/chat/status
   ```

3. Verify google-generativeai is installed:
   ```bash
   pip list | grep google-generativeai
   ```
   If not installed:
   ```bash
   pip install google-generativeai
   ```

4. Check for API errors in backend logs:
   ```bash
   # Backend console should show any API errors
   ```

5. Test API key directly:
   ```python
   import google.generativeai as genai
   genai.configure(api_key="your-key-here")
   model = genai.GenerativeModel("gemini-1.5-flash")
   response = model.generate_content("Hello")
   print(response.text)
   ```

### Issue: ModuleNotFoundError

**Solution**: Install missing dependencies:
```bash
cd backend
pip install -r requirements.txt
pip install google-generativeai
```

### Issue: Database Errors

**Solution**: Reinitialize the database:
```bash
cd backend
rm mental_health.db  # Delete old database
python -c "from database import init_database; init_database()"
```

### Issue: CORS Errors

**Solution**: Ensure Flask-CORS is properly configured in `app.py`:
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

### Issue: Facial Detection Not Working

**Solutions**:
1. Ensure webcam permissions are granted
2. Check that models are loaded:
   - Look for `models/` directory
   - Verify model files exist
3. Use HTTPS or localhost (required for webcam access)
4. Check browser console for errors

### Issue: Port Already in Use

**Solution**: Use a different port:
```bash
python app.py  # Modify port in app.py
# Or
flask run --port 5001
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Bugs
1. Check existing issues first
2. Create a detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - System information

### Suggesting Features
1. Open an issue with the `enhancement` label
2. Describe the feature and its benefits
3. Provide examples or mockups if possible

### Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Code Style Guidelines
- **Python**: Follow PEP 8
- **JavaScript**: Use ES6+ features, consistent indentation
- **Documentation**: Update README for new features
- **Comments**: Write clear, helpful comments

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

### Project Creator
- **Hereakash** - [GitHub Profile](https://github.com/Hereakash)
- **Deepanshu-kesharwani** - [GitHub Profile](https://github.com/Deepanshu-kesharwani)
- **Devax27** - [GitHub Profile](https://github.com/Devax27)

### Technologies & APIs
- **Google Gemini API** - AI-powered conversational responses
- **face-api.js** - Facial expression recognition
- **Flask** - Backend web framework
- **Scikit-learn** - Machine learning capabilities

### Mental Health Scales
- **PHQ-9**: Patient Health Questionnaire for depression
- **GAD-7**: Generalized Anxiety Disorder scale

### Inspiration & Resources
- National Institute of Mental Health (NIMH)
- World Health Organization (WHO) Mental Health Resources
- Evidence-based mental health interventions

---

## ⚠️ Disclaimer

**This application is intended for educational and informational purposes only.** It is **NOT** a substitute for professional mental health diagnosis, treatment, or advice. 

- **Not Medical Advice**: The assessments and recommendations provided by this application are not medical diagnoses
- **Emergency Situations**: If you are experiencing a mental health crisis, please contact emergency services immediately:
  - **US**: National Suicide Prevention Lifeline: 988
  - **US**: Crisis Text Line: Text HOME to 741741
  - **International**: [IASP Crisis Centres](https://www.iasp.info/resources/Crisis_Centres/)

- **Professional Help**: Always consult with qualified mental health professionals for diagnosis and treatment
- **Data Privacy**: While we prioritize privacy, ensure you follow best practices for securing sensitive health data

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Hereakash/Mental-Health-Detection-Using-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Hereakash/Mental-Health-Detection-Using-AI/discussions)
- **Email**: Create an issue for contact information

---

## 🌟 Star This Repository

If you find this project helpful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for Mental Health Awareness**

*Remember: It's okay to not be okay. Reach out for help when you need it.*

</div>
