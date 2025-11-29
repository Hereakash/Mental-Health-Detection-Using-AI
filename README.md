# Mental Health Early Detection & Intervention System

An AI-powered software tool designed to identify early signs of mental health issues such as depression, anxiety, or stress based on user responses, behavioral data, and linguistic analysis.

## Features

### 1. Self-Assessment Questionnaire
- **PHQ-9 (Patient Health Questionnaire-9)**: Validated clinical tool for depression screening
- **GAD-7 (Generalized Anxiety Disorder-7)**: Validated clinical tool for anxiety screening
- Instant scoring and severity classification
- Risk level assessment with personalized recommendations

### 2. Text Analysis (NLP-based)
- Sentiment analysis to detect emotional tone
- Mental health indicator detection (depression, anxiety, stress keywords)
- Linguistic pattern analysis
- Real-time insights and risk assessment

### 3. Facial Emotion Recognition
- Real-time webcam-based emotion detection using face-api.js
- Detection of 7 basic emotions: happy, sad, angry, fearful, surprised, disgusted, neutral
- Confidence scoring for detected emotions

### 4. Personalized Interventions
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

### Backend (Optional - for advanced API features)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Project Structure

```
Mental-Health-Detection-Using-AI/
├── index.html              # Main HTML file
├── style.css              # Stylesheet with theme support
├── script.js              # Frontend JavaScript
├── README.md              # Project documentation
├── assets/
│   └── images/            # Image assets
├── backend/
│   ├── app.py             # Flask API server
│   ├── mental_health_predictor.py  # ML prediction module
│   ├── text_analyzer.py   # NLP text analysis module
│   └── requirements.txt   # Python dependencies
├── models/                # Face-api.js models directory
└── data/                  # Data files (if any)
```

## Usage

1. **Choose an Assessment Method**:
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

- All questionnaire and text analysis processing happens **locally in the browser**
- No data is sent to external servers (unless backend is deployed)
- Webcam feed is processed locally using face-api.js
- No personal information is stored or transmitted

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