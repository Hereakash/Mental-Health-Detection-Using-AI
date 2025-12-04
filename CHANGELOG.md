# Changelog

All notable changes to the Mental Health Detection Using AI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive README.md with detailed project documentation
- Google Gemini API integration guide with setup instructions
- QUICKSTART.md for quick setup guide
- API_DOCUMENTATION.md with complete REST API reference
- TROUBLESHOOTING.md with common issues and solutions
- CONTRIBUTING.md with contribution guidelines
- LICENSE file (MIT License with mental health specific terms)
- .env.example file for environment variable configuration
- Support for python-dotenv for easy environment variable loading
- Security improvement: API keys now loaded from environment variables

### Changed
- Updated requirements.txt to include google-generativeai package
- Updated backend/chatbot.py to use environment variables for API keys
- Improved chatbot.py with better error handling and fallback mechanisms

### Security
- Removed hardcoded API keys from source code
- Implemented environment variable based configuration
- Added .env to .gitignore for security

## [1.0.0] - Initial Release

### Features

#### AI-Powered Chatbot
- Google Gemini API integration for conversational AI
- Rule-based fallback system when API unavailable
- Emotion and sentiment detection from conversations
- Risk level assessment (low/moderate/high)
- Crisis detection and immediate intervention resources
- Persistent chat history with database storage

#### Mental Health Assessments
- PHQ-9 Depression questionnaire implementation
- GAD-7 Anxiety questionnaire implementation
- NLP-based text analysis with sentiment detection
- Multi-modal combined analysis (questionnaire + text + facial)
- Personalized recommendations based on assessment results

#### Facial Expression Recognition
- Real-time webcam-based emotion detection
- Face-api.js integration for client-side processing
- Emotion history tracking
- Privacy-focused local processing

#### Machine Learning
- Custom ML models for risk prediction
- Support for multiple algorithms (Logistic Regression, Random Forest, Gradient Boosting)
- Model training capability with custom datasets
- TF-IDF vectorization for text features
- Model persistence with joblib

#### Backend API
- Flask REST API with 20+ endpoints
- User management and profiles
- Chat history and analysis
- Assessment storage and retrieval
- Comprehensive reporting system
- Health check and status endpoints

#### Database
- SQLite database for local storage
- User profiles table
- Chat messages with sentiment tracking
- Assessment history
- Chat analysis summaries
- Automatic schema initialization

#### Frontend
- Responsive single-page application
- Dark/light theme toggle
- Four assessment methods (chatbot, questionnaire, text, facial)
- Real-time facial detection visualization
- Chat interface with typing indicators
- Assessment results visualization
- Report generation and viewing

### Technical Implementation

#### Backend Technologies
- Python 3.8+
- Flask 2.3+
- Google Generative AI (Gemini)
- Scikit-learn for ML
- SQLite3 for database
- Flask-CORS for cross-origin requests

#### Frontend Technologies
- Vanilla JavaScript (ES6+)
- HTML5 with semantic markup
- CSS3 with modern features
- Face-api.js for facial recognition
- Font Awesome icons

#### Development Tools
- Virtual environment support
- Environment variable configuration
- Gunicorn for production deployment
- Git version control

### Documentation
- Comprehensive README with setup instructions
- Inline code documentation
- API endpoint documentation
- Database schema documentation
- Mental health assessment scale information

### Privacy & Security
- Local facial detection processing
- Secure API key management
- SQLite database with proper access controls
- No external data sharing for facial detection
- Clear privacy disclosures

### Mental Health Features
- Evidence-based assessment scales (PHQ-9, GAD-7)
- Crisis intervention resources
- Professional help recommendations
- Coping strategies based on detected conditions
- Risk-appropriate response messaging
- Clear disclaimers about limitations

---

## Version History Summary

- **[Unreleased]** - Documentation improvements and security enhancements
- **[1.0.0]** - Initial release with core features

---

## How to Read This Changelog

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

---

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## Links

- [GitHub Repository](https://github.com/Hereakash/Mental-Health-Detection-Using-AI)
- [Issue Tracker](https://github.com/Hereakash/Mental-Health-Detection-Using-AI/issues)
- [Documentation](README.md)
