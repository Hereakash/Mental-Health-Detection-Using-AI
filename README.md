# Mental Health Early Detection & Intervention System

An AI-powered software tool designed to identify early signs of mental health issues such as depression, anxiety, or stress based on user responses, behavioral data, and linguistic analysis.

## Features

### 1. AI Chatbot (NEW!)
- **Conversational AI**: Chat with MindfulAI for personalized mental health support
- **OpenAI GPT Integration**: Uses GPT-3.5/4 when API key is configured
- **Rule-based Fallback**: Works without API key using pattern matching
- **Emotion Detection**: Analyzes messages for emotions and mental health concerns
- **User Profile Storage**: Save user details in SQLite database
- **Chat History**: Persistent conversation storage across sessions
- **Report Generation**: Generate downloadable assessment reports

### 2. Self-Assessment Questionnaire
- **PHQ-9 (Patient Health Questionnaire-9)**: Validated clinical tool for depression screening
- **GAD-7 (Generalized Anxiety Disorder-7)**: Validated clinical tool for anxiety screening
- Instant scoring and severity classification
- Risk level assessment with personalized recommendations

### 3. Text Analysis (NLP-based)
- Sentiment analysis to detect emotional tone
- Mental health indicator detection (depression, anxiety, stress keywords)
- Linguistic pattern analysis
- Real-time insights and risk assessment

### 4. Machine Learning Model (NEW!)
- **Model Training**: Train on mental health text datasets
- **Multiple Algorithms**: Logistic Regression, Random Forest, Gradient Boosting
- **TF-IDF Features**: Text vectorization with n-grams
- **Risk Prediction**: Predict low/moderate/high risk from text

### 5. Facial Emotion Recognition
- Real-time webcam-based emotion detection using face-api.js
- Detection of 7 basic emotions: happy, sad, angry, fearful, surprised, disgusted, neutral
- Confidence scoring for detected emotions
- **Works offline** - face-api.js library and models included locally
- 📖 [Quick Start Guide](QUICK_START_FACIAL_DETECTION.md) | [Troubleshooting](TROUBLESHOOTING_FACIAL_DETECTION.md)

### 6. Personalized Interventions
- Emotion-specific recommendations and coping strategies
- Guided breathing exercises
- Mindfulness and relaxation techniques
- Crisis resources and professional help information

## Tech Stack

### Frontend
- HTML5, CSS3 (with CSS Variables for theming)
- Vanilla JavaScript
- face-api.js for facial emotion recognition
- Font Awesome for icons
- Responsive design with glassmorphism UI

### Backend (Python Flask)
- Flask web framework
- **SQLite Database**: User profiles, chat history, assessments
- **OpenAI API Integration**: AI-powered chatbot responses
- **Scikit-learn**: ML model training and predictions
- Mental health prediction module
- Text analysis module with NLP
- RESTful API endpoints

## Installation

### Prerequisites

**For Facial Detection Feature:**
- Modern web browser with webcam support (Chrome, Firefox, Edge, Safari)
- HTTPS connection OR localhost (required for camera access)
- Camera permissions granted to the browser
- Face-API.js library (included locally in `assets/js/`) with CDN fallback
- Face-API.js models are included in the `models/` directory (~7MB)

### Frontend (Static Files)
**⚠️ IMPORTANT**: The application MUST be served through a web server (not opened directly).

```bash
# Using Python's built-in server (recommended)
python -m http.server 8080
# Then visit http://localhost:8080

# Using Node.js http-server
npx http-server -p 8080
# Then visit http://localhost:8080
```

**Verify Your Setup:**
```bash
# Run the verification script to check if everything is configured correctly
bash verify-setup.sh
```

**Important for Facial Detection:**
- ✅ The application must be served over HTTPS or from localhost
- ❌ Camera access will NOT work when opening the HTML file directly (file://)
- ✅ Ensure no other application is using your camera
- ✅ Face-api.js library is included locally (works offline)
- ✅ All model files are included in the repository
- 📖 **Having issues?** See [Troubleshooting Guide](TROUBLESHOOTING_FACIAL_DETECTION.md)


### Backend (For Database, AI Chatbot, and ML Features)
```bash
cd backend
pip install -r requirements.txt

# Optional: Set OpenAI API key for AI-powered chatbot
export OPENAI_API_KEY="your-api-key-here"

# Optional: Set Flask debug mode
export FLASK_DEBUG=true

# Run the server
python app.py
```

## Model Training

The system includes machine learning models that can be trained to predict mental health risk levels from text.

> 📘 **Quick Reference:** See [Quick Start Guide](docs/QUICK_START.md) for the fastest way to get started!

### Quick Start - Train a Model

```bash
cd backend

# Train with built-in sample data
python train_model.py

# Train with your own dataset
python train_model.py --data ../datasets/my_dataset.csv

# Choose a specific algorithm
python train_model.py --model random_forest
```

### Available Model Types

| Model | Best For | Training Speed | Accuracy |
|-------|----------|----------------|----------|
| **Logistic Regression** (default) | General use, quick testing | ⚡ Fast | Good |
| **Random Forest** | Robust predictions | ⚡⚡ Moderate | Better |
| **Gradient Boosting** | Maximum accuracy | ⚡⚡⚡ Slower | Best |

### Dataset Format

Create a CSV file with two columns:

```csv
text,label
"I feel happy and optimistic",low
"I've been feeling anxious",moderate
"I feel hopeless and trapped",high
```

**Labels must be:** `low`, `moderate`, or `high`

### Training Options

```bash
# Train with custom dataset
python train_model.py --data path/to/dataset.csv

# Choose model algorithm  
python train_model.py --model logistic_regression
python train_model.py --model random_forest
python train_model.py --model gradient_boosting

# Adjust train/test split
python train_model.py --test-size 0.3

# Test with specific texts
python train_model.py --test-texts "I feel great" "I'm worried"

# Skip testing after training
python train_model.py --no-test
```

### Sample Datasets

We provide sample datasets in the `datasets/` directory:
- **`sample_dataset.csv`** - 40 examples for testing
- **`template_dataset.csv`** - Template to create your own dataset

### Programmatic Training

You can also train models programmatically:

```python
from ml_model import MentalHealthMLModel

# Initialize model
model = MentalHealthMLModel()

# Train with custom data
texts = ["I feel great", "I'm anxious", "I'm hopeless"]
labels = ["low", "moderate", "high"]
results = model.train(texts, labels, model_type="random_forest")

# View results
print(f"Accuracy: {results['accuracy']:.2%}")

# Make predictions
prediction = model.predict("I've been feeling stressed")
print(f"Risk Level: {prediction['risk_level']}")
print(f"Confidence: {prediction['confidence']:.2%}")
```

### Training via API

Train models through REST API endpoints:

```bash
# Train with sample data
curl -X POST http://localhost:5000/api/model/train

# Train with specific model type
curl -X POST http://localhost:5000/api/model/train \
  -H "Content-Type: application/json" \
  -d '{"model_type": "random_forest"}'
```

### 📖 Complete Training Guide

For detailed instructions, see the [Model Training Guide](docs/MODEL_TRAINING.md):
- Dataset preparation guidelines
- Model selection advice  
- Performance optimization
- Best practices
- Troubleshooting

## API Endpoints

### User Management
- `POST /api/users` - Create a new user
- `GET /api/users/<id>` - Get user by ID
- `GET /api/users` - List all users

### Chatbot
- `POST /api/chat` - Send message to chatbot
- `GET /api/chat/history/<user_id>` - Get chat history
- `DELETE /api/chat/history/<user_id>` - Clear chat history
- `GET /api/chat/status` - Get chatbot API status

### ML Model
- `POST /api/model/train` - Train the ML model
- `POST /api/model/predict` - Predict risk from text
- `GET /api/model/info` - Get model information

### Assessments
- `POST /api/analyze/questionnaire` - Analyze questionnaire
- `POST /api/analyze/text` - Analyze text input
- `POST /api/analyze/combined` - Combined analysis
- `POST /api/assessments/<user_id>` - Save assessment
- `GET /api/assessments/<user_id>` - Get assessment history
- `GET /api/report/<user_id>` - Generate comprehensive report

## Project Structure

```
Mental-Health-Detection-Using-AI/
├── index.html              # Main HTML file
├── style.css               # Stylesheet with theme support
├── script.js               # Frontend JavaScript
├── README.md               # Project documentation
├── TROUBLESHOOTING_FACIAL_DETECTION.md  # Facial detection troubleshooting guide
├── verify-setup.sh         # Setup verification script
├── assets/
│   ├── images/             # Image assets
│   └── js/
│       └── face-api.min.js # Face-API.js library (local, ~649KB)
├── models/                 # Face-API.js models for facial detection (~7MB)
│   ├── README.md           # Models documentation
│   ├── tiny_face_detector_model-*
│   ├── face_landmark_68_model-*
│   ├── face_recognition_model-*
│   └── face_expression_model-*
├── backend/
│   ├── app.py              # Flask API server
│   ├── database.py         # SQLite database operations
│   ├── chatbot.py          # AI chatbot module
│   ├── ml_model.py         # ML model training/prediction
│   ├── train_model.py      # Standalone training script
│   ├── mental_health_predictor.py  # Clinical scale scoring
│   ├── text_analyzer.py    # NLP text analysis
│   ├── requirements.txt    # Python dependencies
│   └── models/             # Trained ML models (auto-generated)
├── datasets/               # Training datasets
│   ├── README.md           # Dataset documentation
│   ├── sample_dataset.csv  # Sample training data (40 examples)
│   └── template_dataset.csv # Empty template for custom datasets
├── docs/
│   └── MODEL_TRAINING.md   # Comprehensive model training guide
└── mental_health.db        # SQLite database (auto-generated)
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI chatbot | No (falls back to rule-based) |
| `OPENAI_MODEL` | OpenAI model to use (default: gpt-3.5-turbo) | No |
| `FLASK_DEBUG` | Enable Flask debug mode | No |
| `DATABASE_PATH` | Custom database file path | No |
| `MODEL_DIR` | Directory for ML models | No |

## Usage

1. **Choose an Assessment Method**:
   - **AI Chatbot**: Chat for personalized support and get reports
   - **Questionnaire**: Answer PHQ-9 and GAD-7 questions
   - **Text Analysis**: Write about your feelings for NLP analysis
   - **Facial Detection**: Use webcam for emotion recognition

2. **View Results**: Get instant feedback including:
   - Severity scores and classifications
   - Risk level assessment
   - Detected concerns

3. **Get Recommendations**: Receive personalized:
   - Coping strategies
   - Breathing exercises
   - Professional resources

4. **Generate Reports**: Download comprehensive mental health reports

## Clinical Scales Used

### PHQ-9 Scoring (Depression)
- 0-4: Minimal depression
- 5-9: Mild depression
- 10-14: Moderate depression
- 15-19: Moderately severe depression
- 20-27: Severe depression

### GAD-7 Scoring (Anxiety)
- 0-4: Minimal anxiety
- 5-9: Mild anxiety
- 10-14: Moderate anxiety
- 15-21: Severe anxiety

## Privacy & Security

- **Local Processing**: Questionnaire and basic analysis in browser
- **Optional Backend**: Database storage requires backend server
- **Data Encryption**: SQLite database stored locally
- **No External Tracking**: No analytics or tracking scripts
- **API Key Security**: OpenAI key stored as environment variable

## Troubleshooting

### Facial Detection Issues

⚠️ **Having issues with facial detection?** See the comprehensive [Troubleshooting Guide](TROUBLESHOOTING_FACIAL_DETECTION.md) for detailed solutions.

**Quick Fixes:**

**Problem: "Failed to load AI models" despite having internet**
- **Cause**: CDN blocked, or not using web server, or CORS issues
- **Solution**: 
  1. ✅ Use a web server: `python -m http.server 8080`
  2. ✅ Visit `http://localhost:8080` (NOT `file://`)
  3. ✅ Disable ad-blockers temporarily
  4. ✅ Check browser console (F12) for specific errors
  5. ✅ Face-api.js now loads locally (no CDN required!)

**Problem: "Library not loaded"**
- **Cause**: CDN blocked or local file missing
- **Solution**: 
  - Verify `assets/js/face-api.min.js` exists (649KB)
  - Disable ad-blockers/firewalls blocking CDN
  - Refresh page after disabling blockers

**Problem: "Camera access denied" or "Unable to access camera"**
- **Solution 1**: Grant camera permissions in your browser
  - Chrome: Click the camera icon in the address bar → Allow
  - Firefox: Click the shield/lock icon → Permissions → Camera → Allow
  - Safari: Safari menu → Settings for This Website → Camera → Allow
- **Solution 2**: Ensure you're using HTTPS or localhost
  - Camera access requires a secure context
  - Use `python -m http.server 8080` and visit `http://localhost:8080`
- **Solution 3**: Check if another application is using the camera
  - Close other video conferencing apps (Zoom, Teams, etc.)
  - Restart your browser

**Problem: "No camera found"**
- **Solution**: Connect a webcam device and refresh the page
- Verify your camera works in other applications

**Problem: "Camera initialization timed out"**
- **Solution**: 
  - Refresh the page and try again
  - Check if your camera drivers are up to date
  - Try a different browser

📖 **For detailed troubleshooting**, see [TROUBLESHOOTING_FACIAL_DETECTION.md](TROUBLESHOOTING_FACIAL_DETECTION.md)

### Backend/API Issues

**Problem: Backend server won't start**
- **Solution**: Ensure all dependencies are installed: `pip install -r backend/requirements.txt`
- Check if port 5000 is already in use

**Problem: OpenAI chatbot not working**
- **Solution**: The app falls back to rule-based responses if no API key is set
- Set `OPENAI_API_KEY` environment variable for AI-powered responses

## Disclaimer

⚠️ **This application is NOT a substitute for professional mental health care.**

- It is designed for educational and early detection purposes only
- If you are experiencing a mental health crisis, please contact emergency services
- Always consult with qualified mental health professionals for diagnosis and treatment

## Emergency Resources

- **National Suicide Prevention Lifeline**: 988 or 1-800-273-8255
- **Crisis Text Line**: Text HOME to 741741
- **SAMHSA National Helpline**: 1-800-662-4357

## License

This project is for educational purposes. Please use responsibly.

## References

- PHQ-9: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure.
- GAD-7: Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder.
- face-api.js: JavaScript face detection and recognition library
- DAIC-WOZ Depression Dataset
- CLPsych Shared Task papers
- OpenAI GPT API Documentation
- Scikit-learn Machine Learning Library