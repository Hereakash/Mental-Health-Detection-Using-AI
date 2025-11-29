"""
Mental Health Early Detection & Intervention System
Flask Backend API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from mental_health_predictor import MentalHealthPredictor
from text_analyzer import TextAnalyzer

app = Flask(__name__)
CORS(app)

# Initialize the predictor and analyzer
predictor = MentalHealthPredictor()
text_analyzer = TextAnalyzer()


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


if __name__ == '__main__':
    import os
    # Only enable debug mode in development, not in production
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
