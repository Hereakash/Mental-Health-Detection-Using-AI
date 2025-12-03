"""
Mental Health Early Detection & Intervention System
Flask Backend API

Features:
- User management with database storage
- AI-powered chatbot (OpenAI GPT integration)
- ML model training and predictions
- Text analysis and questionnaire assessments
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os
from mental_health_predictor import MentalHealthPredictor
from text_analyzer import TextAnalyzer
from database import (
    create_user, get_user, get_user_by_email, update_user_activity, get_all_users,
    save_chat_message, get_chat_history, clear_chat_history,
    save_assessment, get_user_assessments,
    save_chat_analysis, get_chat_analysis
)
from chatbot import MentalHealthChatbot
from ml_model import get_model, MentalHealthMLModel

app = Flask(__name__)
# Configure CORS to allow requests from GitHub Pages and other deployment platforms
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.github.io",
            "https://*.vercel.app",
            "https://*.netlify.app"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize components
predictor = MentalHealthPredictor()
text_analyzer = TextAnalyzer()
chatbot = MentalHealthChatbot()
ml_model = get_model()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Mental Health Detection API is running'})


@app.route('/api/analyze/questionnaire', methods=['POST'])
def analyze_questionnaire():
    """
    Analyze questionnaire responses and predict mental health risk
    
    Expected JSON body:
    {
        "responses": {
            "phq9": [0, 1, 2, 3, 0, 1, 2, 1, 0],  # PHQ-9 responses (0-3 scale)
            "gad7": [0, 1, 2, 3, 0, 1, 2]          # GAD-7 responses (0-3 scale)
        }
    }
    """
    try:
        data = request.get_json()
        if not data or 'responses' not in data:
            return jsonify({'error': 'No responses provided'}), 400
        
        responses = data['responses']
        result = predictor.predict_from_questionnaire(responses)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze/text', methods=['POST'])
def analyze_text():
    """
    Analyze text input for sentiment and mental health indicators
    
    Expected JSON body:
    {
        "text": "User's text input describing their feelings..."
    }
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        if not text.strip():
            return jsonify({'error': 'Empty text provided'}), 400
        
        result = text_analyzer.analyze(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze/combined', methods=['POST'])
def analyze_combined():
    """
    Combined analysis of questionnaire and text input
    
    Expected JSON body:
    {
        "responses": {...},
        "text": "...",
        "facial_emotion": "happy"  # optional
    }
    """
    try:
        data = request.get_json()
        
        results = {}
        
        # Analyze questionnaire if provided
        if 'responses' in data and data['responses']:
            results['questionnaire'] = predictor.predict_from_questionnaire(data['responses'])
        
        # Analyze text if provided
        if 'text' in data and data['text'].strip():
            results['text_analysis'] = text_analyzer.analyze(data['text'])
        
        # Include facial emotion if provided
        if 'facial_emotion' in data:
            results['facial_emotion'] = data['facial_emotion']
        
        # Generate combined assessment
        results['combined_assessment'] = predictor.generate_combined_assessment(results)
        
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Get personalized recommendations based on assessment results
    
    Expected JSON body:
    {
        "risk_level": "moderate",
        "conditions": ["depression", "anxiety"],
        "scores": {...}
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        recommendations = predictor.get_recommendations(data)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =====================================================
# USER MANAGEMENT ENDPOINTS
# =====================================================

@app.route('/api/users', methods=['POST'])
def create_new_user():
    """
    Create a new user
    
    Expected JSON body:
    {
        "name": "User Name",
        "email": "user@example.com",  # optional
        "age": 25  # optional
    }
    """
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Name is required'}), 400
        
        name = data['name'].strip()
        email = data.get('email', '').strip() or None
        age = data.get('age')
        
        # Check if user with email already exists
        if email:
            existing_user = get_user_by_email(email)
            if existing_user:
                update_user_activity(existing_user['id'])
                return jsonify({
                    'user_id': existing_user['id'],
                    'message': 'Existing user found',
                    'user': existing_user
                })
        
        # Create new user
        user_id = create_user(name, email, age)
        user = get_user(user_id)
        
        return jsonify({
            'user_id': user_id,
            'message': 'User created successfully',
            'user': user
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_info(user_id):
    """Get user information by ID"""
    try:
        user = get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/users', methods=['GET'])
def list_users():
    """Get all users"""
    try:
        users = get_all_users()
        return jsonify({'users': users, 'count': len(users)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =====================================================
# CHATBOT ENDPOINTS
# =====================================================

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Send a message to the chatbot
    
    Expected JSON body:
    {
        "user_id": 1,
        "message": "I'm feeling anxious today"
    }
    """
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_id = data.get('user_id')
        message = data['message'].strip()
        
        if not message:
            return jsonify({'error': 'Empty message'}), 400
        
        # Get user info for personalization
        user_name = None
        if user_id:
            user = get_user(user_id)
            if user:
                user_name = user.get('name')
                update_user_activity(user_id)
        
        # Get chat history for context
        history = []
        if user_id:
            history = get_chat_history(user_id, limit=10)
        
        # Get chatbot response
        result = chatbot.get_response(message, history, user_name)
        
        # Save messages to database if user_id provided
        if user_id:
            # Save user message
            save_chat_message(
                user_id, 'user', message,
                sentiment=result.get('risk_level'),
                emotions=result.get('emotions')
            )
            
            # Save bot response
            save_chat_message(user_id, 'bot', result['response'])
            
            # Update chat analysis
            analysis = get_chat_analysis(user_id) or {
                'message_count': 0,
                'detected_emotions': [],
                'topics': [],
                'overall_sentiment': 'neutral',
                'risk_level': 'low'
            }
            
            # Update analysis data
            message_count = analysis.get('message_count', 0) + 1
            detected_emotions = list(set(analysis.get('detected_emotions', []) + result.get('emotions', [])))
            topics = list(set(analysis.get('topics', []) + result.get('topics', [])))
            
            # Determine overall sentiment from emotions
            positive_emotions = ['happy']
            negative_emotions = ['sad', 'anxious', 'stressed', 'angry', 'lonely']
            neg_count = len([e for e in detected_emotions if e in negative_emotions])
            pos_count = len([e for e in detected_emotions if e in positive_emotions])
            overall_sentiment = 'positive' if pos_count > neg_count else ('negative' if neg_count > 0 else 'neutral')
            
            save_chat_analysis(
                user_id,
                message_count,
                detected_emotions,
                topics,
                overall_sentiment,
                result.get('risk_level', 'low')
            )
        
        return jsonify({
            'response': result['response'],
            'emotions': result.get('emotions', []),
            'topics': result.get('topics', []),
            'risk_level': result.get('risk_level', 'low'),
            'using_ai': chatbot.is_using_ai()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat/history/<int:user_id>', methods=['GET'])
def get_user_chat_history(user_id):
    """Get chat history for a user"""
    try:
        limit = request.args.get('limit', 50, type=int)
        history = get_chat_history(user_id, limit)
        return jsonify({'messages': history, 'count': len(history)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat/history/<int:user_id>', methods=['DELETE'])
def delete_chat_history(user_id):
    """Clear chat history for a user"""
    try:
        clear_chat_history(user_id)
        return jsonify({'message': 'Chat history cleared successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat/analysis/<int:user_id>', methods=['GET'])
def get_user_chat_analysis(user_id):
    """Get chat analysis summary for a user"""
    try:
        analysis = get_chat_analysis(user_id)
        if not analysis:
            return jsonify({'message': 'No analysis found', 'analysis': None})
        return jsonify({'analysis': analysis})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat/status', methods=['GET'])
def get_chat_status():
    """Get chatbot API status"""
    return jsonify(chatbot.get_api_status())


# =====================================================
# ML MODEL ENDPOINTS
# =====================================================

@app.route('/api/model/train', methods=['POST'])
def train_model():
    """
    Train the ML model
    
    Expected JSON body (optional):
    {
        "model_type": "logistic_regression",  # or "random_forest", "gradient_boosting"
        "texts": ["sample text 1", ...],
        "labels": ["low", "moderate", "high", ...]
    }
    """
    try:
        data = request.get_json() or {}
        
        model_type = data.get('model_type', 'logistic_regression')
        texts = data.get('texts')
        labels = data.get('labels')
        
        # Train model (uses sample data if none provided)
        result = ml_model.train(texts, labels, model_type)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/predict', methods=['POST'])
def predict_risk():
    """
    Predict mental health risk from text using ML model
    
    Expected JSON body:
    {
        "text": "User's text describing their feelings..."
    }
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text'].strip()
        if not text:
            return jsonify({'error': 'Empty text provided'}), 400
        
        result = ml_model.predict(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/info', methods=['GET'])
def get_model_info():
    """Get information about the ML model"""
    return jsonify(ml_model.get_model_info())


# =====================================================
# ASSESSMENT STORAGE ENDPOINTS
# =====================================================

@app.route('/api/assessments/<int:user_id>', methods=['POST'])
def save_user_assessment(user_id):
    """
    Save an assessment result for a user
    
    Expected JSON body:
    {
        "assessment_type": "questionnaire",  # or "text", "combined"
        "scores": {...},
        "risk_level": "moderate",
        "conditions": ["depression"],
        "recommendations": [...]
    }
    """
    try:
        data = request.get_json()
        if not data or 'assessment_type' not in data:
            return jsonify({'error': 'Assessment type is required'}), 400
        
        assessment_id = save_assessment(
            user_id,
            data['assessment_type'],
            data.get('scores'),
            data.get('risk_level', 'unknown'),
            data.get('conditions'),
            data.get('recommendations')
        )
        
        return jsonify({
            'assessment_id': assessment_id,
            'message': 'Assessment saved successfully'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/assessments/<int:user_id>', methods=['GET'])
def get_assessments(user_id):
    """Get assessment history for a user"""
    try:
        limit = request.args.get('limit', 10, type=int)
        assessments = get_user_assessments(user_id, limit)
        return jsonify({'assessments': assessments, 'count': len(assessments)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/report/<int:user_id>', methods=['GET'])
def generate_user_report(user_id):
    """Generate a comprehensive report for a user"""
    try:
        user = get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get chat analysis
        analysis = get_chat_analysis(user_id)
        
        # Get recent assessments
        assessments = get_user_assessments(user_id, limit=5)
        
        # Get chat history summary
        chat_history = get_chat_history(user_id, limit=100)
        user_messages = [m for m in chat_history if m.get('role') == 'user']
        
        # Generate recommendations based on analysis
        recommendations = []
        if analysis:
            emotions = analysis.get('detected_emotions', [])
            risk = analysis.get('risk_level', 'low')
            
            if 'anxious' in emotions:
                recommendations.append('Practice daily relaxation techniques such as deep breathing')
                recommendations.append('Consider limiting caffeine intake')
            if 'sad' in emotions or 'depressed' in emotions:
                recommendations.append('Engage in activities that bring you joy')
                recommendations.append('Maintain social connections')
            if 'stressed' in emotions:
                recommendations.append('Break tasks into smaller manageable steps')
                recommendations.append('Schedule regular breaks')
            if risk in ['moderate', 'high']:
                recommendations.insert(0, 'Consider speaking with a mental health professional')
        
        if not recommendations:
            recommendations = [
                'Continue practicing self-awareness',
                'Maintain healthy lifestyle habits',
                'Build and nurture supportive relationships'
            ]
        
        report = {
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user.get('email'),
                'age': user.get('age')
            },
            'summary': {
                'total_messages': len(user_messages),
                'total_assessments': len(assessments),
                'detected_emotions': analysis.get('detected_emotions', []) if analysis else [],
                'topics_discussed': analysis.get('topics', []) if analysis else [],
                'overall_sentiment': analysis.get('overall_sentiment', 'neutral') if analysis else 'neutral',
                'risk_level': analysis.get('risk_level', 'low') if analysis else 'low'
            },
            'recent_assessments': assessments[:3],
            'recommendations': recommendations,
            'generated_at': datetime.now().isoformat()
        }
        
        return jsonify(report)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    import os
    # Only enable debug mode in development, not in production
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
