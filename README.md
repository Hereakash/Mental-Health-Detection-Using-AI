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

### Frontend (Static Files)
Simply open `index.html` in a web browser, or serve with any static file server:

```bash
# Using Python's built-in server
python -m http.server 8080

# Using Node.js http-server
npx http-server
```

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
├── assets/
│   └── images/             # Image assets
├── backend/
│   ├── app.py              # Flask API server
│   ├── database.py         # SQLite database operations
│   ├── chatbot.py          # AI chatbot module
│   ├── ml_model.py         # ML model training/prediction
│   ├── train_model.py      # Standalone training script
│   ├── mental_health_predictor.py  # Clinical scale scoring
│   ├── text_analyzer.py    # NLP text analysis
│   └── requirements.txt    # Python dependencies
├── datasets/               # Training datasets
│   ├── README.md           # Dataset documentation
│   ├── sample_dataset.csv  # Sample training data (40 examples)
│   └── template_dataset.csv # Empty template for custom datasets
├── docs/
│   └── MODEL_TRAINING.md   # Comprehensive model training guide
├── models/                 # Trained ML models (auto-generated)
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