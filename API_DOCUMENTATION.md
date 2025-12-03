# 📡 API Documentation - Mental Health Detection System

Complete REST API reference for the Mental Health Detection backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. For production deployment, consider implementing:
- API keys
- OAuth 2.0
- JWT tokens

---

## Table of Contents

1. [Health Check](#health-check)
2. [User Management](#user-management)
3. [Chatbot Endpoints](#chatbot-endpoints)
4. [Assessment Endpoints](#assessment-endpoints)
5. [Machine Learning Endpoints](#machine-learning-endpoints)
6. [Report Generation](#report-generation)

---

## Health Check

### Check API Status

**Endpoint:** `GET /api/health`

**Description:** Health check to verify the API is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Mental Health Detection API is running"
}
```

**Example:**
```bash
curl http://localhost:5000/api/health
```

---

## User Management

### Create User

**Endpoint:** `POST /api/users`

**Description:** Create a new user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25
}
```

**Fields:**
- `name` (string, required): User's full name
- `email` (string, optional): User's email address
- `age` (integer, optional): User's age

**Response:**
```json
{
  "user_id": 1,
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "created_at": "2024-01-01T10:00:00",
    "last_active": "2024-01-01T10:00:00"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":25}'
```

### Get User by ID

**Endpoint:** `GET /api/users/{user_id}`

**Description:** Retrieve user information by ID.

**Parameters:**
- `user_id` (integer, path): User ID

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "created_at": "2024-01-01T10:00:00",
  "last_active": "2024-01-01T10:00:00"
}
```

**Example:**
```bash
curl http://localhost:5000/api/users/1
```

### List All Users

**Endpoint:** `GET /api/users`

**Description:** Get a list of all users.

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl http://localhost:5000/api/users
```

---

## Chatbot Endpoints

### Send Chat Message

**Endpoint:** `POST /api/chat`

**Description:** Send a message to the AI chatbot and receive a response.

**Request Body:**
```json
{
  "user_id": 1,
  "message": "I'm feeling anxious today"
}
```

**Fields:**
- `user_id` (integer, optional): User ID for personalized responses and history
- `message` (string, required): User's message text

**Response:**
```json
{
  "response": "I hear that you're experiencing anxiety. That can be really uncomfortable...",
  "emotions": ["anxious"],
  "topics": ["health"],
  "risk_level": "moderate",
  "using_ai": true
}
```

**Response Fields:**
- `response`: AI-generated or rule-based response
- `emotions`: Detected emotions in user message
- `topics`: Identified conversation topics
- `risk_level`: Assessed risk level (low/moderate/high)
- `using_ai`: Boolean indicating if AI (Gemini) was used

**Example:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"message":"I feel overwhelmed with work"}'
```

### Get Chat History

**Endpoint:** `GET /api/chat/history/{user_id}`

**Description:** Retrieve conversation history for a user.

**Parameters:**
- `user_id` (integer, path): User ID
- `limit` (integer, query, optional): Maximum messages to return (default: 50)

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "I'm feeling anxious",
      "timestamp": "2024-01-01T10:00:00",
      "sentiment": "moderate",
      "emotions": ["anxious"]
    },
    {
      "id": 2,
      "role": "bot",
      "content": "I hear that you're experiencing anxiety...",
      "timestamp": "2024-01-01T10:00:01"
    }
  ],
  "count": 2
}
```

**Example:**
```bash
curl http://localhost:5000/api/chat/history/1?limit=20
```

### Clear Chat History

**Endpoint:** `DELETE /api/chat/history/{user_id}`

**Description:** Delete all chat messages for a user.

**Parameters:**
- `user_id` (integer, path): User ID

**Response:**
```json
{
  "message": "Chat history cleared successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/chat/history/1
```

### Get Chat Analysis

**Endpoint:** `GET /api/chat/analysis/{user_id}`

**Description:** Get aggregated conversation analysis for a user.

**Response:**
```json
{
  "analysis": {
    "message_count": 25,
    "detected_emotions": ["anxious", "stressed", "hopeful"],
    "topics": ["work", "health", "relationships"],
    "overall_sentiment": "neutral",
    "risk_level": "moderate",
    "updated_at": "2024-01-01T10:00:00"
  }
}
```

**Example:**
```bash
curl http://localhost:5000/api/chat/analysis/1
```

### Check Chatbot Status

**Endpoint:** `GET /api/chat/status`

**Description:** Get chatbot configuration and API status.

**Response:**
```json
{
  "gemini_available": true,
  "api_key_configured": true,
  "using_ai": true,
  "model": "gemini-1.5-flash"
}
```

**Example:**
```bash
curl http://localhost:5000/api/chat/status
```

---

## Assessment Endpoints

### Analyze Questionnaire

**Endpoint:** `POST /api/analyze/questionnaire`

**Description:** Analyze PHQ-9 and GAD-7 questionnaire responses.

**Request Body:**
```json
{
  "responses": {
    "phq9": [0, 1, 2, 3, 0, 1, 2, 1, 0],
    "gad7": [0, 1, 2, 3, 0, 1, 2]
  }
}
```

**Fields:**
- `phq9` (array of 9 integers, 0-3): PHQ-9 depression questionnaire responses
- `gad7` (array of 7 integers, 0-3): GAD-7 anxiety questionnaire responses

**Scoring:**
- `0` = Not at all
- `1` = Several days
- `2` = More than half the days
- `3` = Nearly every day

**Response:**
```json
{
  "scores": {
    "depression": 10,
    "anxiety": 13
  },
  "severity": {
    "depression": "moderate",
    "anxiety": "moderate"
  },
  "risk_level": "moderate",
  "conditions_detected": ["depression", "anxiety"],
  "recommendations_priority": [
    "schedule_professional_consultation",
    "self_care_strategies",
    "depression_coping_strategies",
    "anxiety_coping_strategies"
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/analyze/questionnaire \
  -H "Content-Type: application/json" \
  -d '{"responses":{"phq9":[1,1,2,2,1,1,2,1,1],"gad7":[2,2,1,2,1,2,1]}}'
```

### Analyze Text

**Endpoint:** `POST /api/analyze/text`

**Description:** Perform NLP analysis on user-provided text.

**Request Body:**
```json
{
  "text": "I've been feeling really down lately and can't seem to enjoy things I used to love"
}
```

**Response:**
```json
{
  "sentiment": {
    "polarity": -0.45,
    "subjectivity": 0.67,
    "positive_words": 1,
    "negative_words": 3,
    "interpretation": "negative"
  },
  "indicators": {
    "depression": {
      "level": "moderate",
      "keywords_found": ["down", "can't"]
    },
    "anxiety": {
      "level": "none",
      "keywords_found": []
    },
    "stress": {
      "level": "none",
      "keywords_found": []
    },
    "positive": {
      "keywords_found": ["love"]
    }
  },
  "risk_level": "low",
  "insights": [
    {
      "type": "concern",
      "message": "Your text reflects some negative emotions. This is normal to experience sometimes."
    }
  ],
  "word_count": 15,
  "concerns_detected": ["depression"]
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"text":"I have been feeling overwhelmed and stressed at work"}'
```

### Combined Analysis

**Endpoint:** `POST /api/analyze/combined`

**Description:** Perform multi-modal analysis combining questionnaire, text, and facial data.

**Request Body:**
```json
{
  "responses": {
    "phq9": [1, 1, 2, 2, 1, 1, 2, 1, 1],
    "gad7": [2, 2, 1, 2, 1, 2, 1]
  },
  "text": "I'm feeling stressed and overwhelmed",
  "facial_emotion": "sad"
}
```

**Response:**
```json
{
  "questionnaire": { /* questionnaire analysis */ },
  "text_analysis": { /* text analysis */ },
  "facial_emotion": "sad",
  "combined_assessment": {
    "overall_risk": "moderate",
    "confidence": "high",
    "concerns": ["depression", "anxiety", "sad_facial_expression"],
    "positive_indicators": [],
    "summary": "Your assessment shows some areas of concern that may benefit from attention..."
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/analyze/combined \
  -H "Content-Type: application/json" \
  -d '{"responses":{"phq9":[1,1,2,2,1,1,2,1,1]},"text":"I feel sad","facial_emotion":"sad"}'
```

### Get Recommendations

**Endpoint:** `POST /api/recommendations`

**Description:** Get personalized recommendations based on assessment results.

**Request Body:**
```json
{
  "risk_level": "moderate",
  "conditions": ["depression", "anxiety"],
  "scores": {
    "depression": 10,
    "anxiety": 13
  }
}
```

**Response:**
```json
{
  "immediate_actions": [],
  "self_care": [
    {
      "title": "Sleep Hygiene",
      "description": "Maintain a consistent sleep schedule...",
      "tips": ["Go to bed at the same time daily", "..."]
    }
  ],
  "coping_strategies": [
    {
      "title": "Behavioral Activation",
      "description": "Schedule small, enjoyable activities...",
      "steps": ["Make a list of activities...", "..."]
    }
  ],
  "professional_resources": [
    {
      "title": "Find a Therapist",
      "description": "Consider working with a licensed professional...",
      "resources": ["Psychology Today Directory", "..."]
    }
  ],
  "lifestyle_changes": []
}
```

---

## Machine Learning Endpoints

### Train Model

**Endpoint:** `POST /api/model/train`

**Description:** Train a new ML model with custom data.

**Request Body:**
```json
{
  "model_type": "logistic_regression",
  "texts": ["I feel great", "I'm very sad", "Feeling anxious"],
  "labels": ["low", "high", "moderate"]
}
```

**Fields:**
- `model_type`: "logistic_regression", "random_forest", or "gradient_boosting"
- `texts` (optional): Training texts (uses sample data if not provided)
- `labels` (optional): Corresponding labels

**Response:**
```json
{
  "status": "success",
  "model_type": "logistic_regression",
  "accuracy": 0.85,
  "message": "Model trained successfully"
}
```

### Predict Risk

**Endpoint:** `POST /api/model/predict`

**Description:** Predict mental health risk from text using trained ML model.

**Request Body:**
```json
{
  "text": "I feel overwhelmed and exhausted all the time"
}
```

**Response:**
```json
{
  "prediction": "moderate",
  "confidence": 0.78,
  "probabilities": {
    "low": 0.15,
    "moderate": 0.78,
    "high": 0.07
  }
}
```

### Get Model Info

**Endpoint:** `GET /api/model/info`

**Description:** Get information about the current ML model.

**Response:**
```json
{
  "is_trained": true,
  "model_type": "logistic_regression",
  "classes": ["low", "moderate", "high"]
}
```

---

## Report Generation

### Generate User Report

**Endpoint:** `GET /api/report/{user_id}`

**Description:** Generate a comprehensive mental health report for a user.

**Parameters:**
- `user_id` (integer, path): User ID

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25
  },
  "summary": {
    "total_messages": 25,
    "total_assessments": 3,
    "detected_emotions": ["anxious", "stressed", "hopeful"],
    "topics_discussed": ["work", "health", "relationships"],
    "overall_sentiment": "neutral",
    "risk_level": "moderate"
  },
  "recent_assessments": [
    {
      "id": 3,
      "assessment_type": "questionnaire",
      "risk_level": "moderate",
      "created_at": "2024-01-01T10:00:00"
    }
  ],
  "recommendations": [
    "Schedule professional consultation",
    "Practice daily relaxation techniques",
    "Maintain social connections"
  ],
  "generated_at": "2024-01-01T11:00:00"
}
```

**Example:**
```bash
curl http://localhost:5000/api/report/1
```

### Save Assessment

**Endpoint:** `POST /api/assessments/{user_id}`

**Description:** Save an assessment result for a user.

**Request Body:**
```json
{
  "assessment_type": "questionnaire",
  "scores": {
    "depression": 10,
    "anxiety": 13
  },
  "risk_level": "moderate",
  "conditions": ["depression", "anxiety"],
  "recommendations": ["seek_counseling", "practice_mindfulness"]
}
```

**Response:**
```json
{
  "assessment_id": 1,
  "message": "Assessment saved successfully"
}
```

### Get Assessment History

**Endpoint:** `GET /api/assessments/{user_id}`

**Description:** Get assessment history for a user.

**Parameters:**
- `limit` (integer, query, optional): Maximum assessments to return (default: 10)

**Response:**
```json
{
  "assessments": [
    {
      "id": 1,
      "assessment_type": "questionnaire",
      "scores": {"depression": 10, "anxiety": 13},
      "risk_level": "moderate",
      "conditions": ["depression", "anxiety"],
      "created_at": "2024-01-01T10:00:00"
    }
  ],
  "count": 1
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider:
- Implementing rate limiting per IP or user
- Using Flask-Limiter or similar libraries
- Setting appropriate limits based on your infrastructure

---

## Webhooks & Real-time Updates

The current API does not support webhooks or WebSocket connections. Future enhancements may include:
- WebSocket support for real-time chat
- Webhooks for assessment completion notifications
- Server-Sent Events (SSE) for live updates

---

## SDK & Client Libraries

Currently, no official SDKs are available. You can use standard HTTP libraries:

**Python:**
```python
import requests

response = requests.post(
    'http://localhost:5000/api/chat',
    json={'message': 'Hello!'}
)
print(response.json())
```

**JavaScript:**
```javascript
fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'Hello!'})
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Additional Resources

- [Main README](README.md)
- [Quick Start Guide](QUICKSTART.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

---

**For questions or issues, please open an issue on GitHub.**
