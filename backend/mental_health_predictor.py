"""
Mental Health Predictor Module

This module implements machine learning models for predicting mental health risk
based on questionnaire responses and other behavioral data.
"""
import json


class MentalHealthPredictor:
    """
    Mental Health Prediction using validated questionnaire scoring
    and machine learning-based risk assessment.
    """
    
    def __init__(self):
        """Initialize the predictor with scoring thresholds"""
        # PHQ-9 Depression Severity Thresholds
        self.phq9_thresholds = {
            'minimal': (0, 4),
            'mild': (5, 9),
            'moderate': (10, 14),
            'moderately_severe': (15, 19),
            'severe': (20, 27)
        }
        
        # GAD-7 Anxiety Severity Thresholds
        self.gad7_thresholds = {
            'minimal': (0, 4),
            'mild': (5, 9),
            'moderate': (10, 14),
            'severe': (15, 21)
        }
        
        # Risk level mapping
        self.risk_mapping = {
            'minimal': 'low',
            'mild': 'low',
            'moderate': 'moderate',
            'moderately_severe': 'high',
            'severe': 'high'
        }
    
    def calculate_phq9_score(self, responses):
        """
        Calculate PHQ-9 depression score
        
        PHQ-9 is a 9-item questionnaire where each item is scored 0-3:
        0 = Not at all
        1 = Several days
        2 = More than half the days
        3 = Nearly every day
        
        Total score ranges from 0-27
        """
        if not responses or len(responses) != 9:
            return None, None
        
        total_score = sum(responses)
        
        # Determine severity
        severity = 'minimal'
        for level, (low, high) in self.phq9_thresholds.items():
            if low <= total_score <= high:
                severity = level
                break
        
        return total_score, severity
    
    def calculate_gad7_score(self, responses):
        """
        Calculate GAD-7 anxiety score
        
        GAD-7 is a 7-item questionnaire where each item is scored 0-3:
        0 = Not at all
        1 = Several days
        2 = More than half the days
        3 = Nearly every day
        
        Total score ranges from 0-21
        """
        if not responses or len(responses) != 7:
            return None, None
        
        total_score = sum(responses)
        
        # Determine severity
        severity = 'minimal'
        for level, (low, high) in self.gad7_thresholds.items():
            if low <= total_score <= high:
                severity = level
                break
        
        return total_score, severity
    
    def predict_from_questionnaire(self, responses):
        """
        Predict mental health risk from questionnaire responses
        
        Args:
            responses: dict containing 'phq9' and/or 'gad7' response lists
        
        Returns:
            dict with scores, severity levels, and risk assessment
        """
        result = {
            'scores': {},
            'severity': {},
            'risk_level': 'low',
            'conditions_detected': [],
            'recommendations_priority': []
        }
        
        max_risk = 'low'
        
        # Process PHQ-9 (Depression)
        if 'phq9' in responses and responses['phq9']:
            score, severity = self.calculate_phq9_score(responses['phq9'])
            if score is not None:
                result['scores']['depression'] = score
                result['severity']['depression'] = severity
                
                risk = self.risk_mapping.get(severity, 'low')
                if severity in ['moderate', 'moderately_severe', 'severe']:
                    result['conditions_detected'].append('depression')
                
                if self._compare_risk(risk, max_risk) > 0:
                    max_risk = risk
        
        # Process GAD-7 (Anxiety)
        if 'gad7' in responses and responses['gad7']:
            score, severity = self.calculate_gad7_score(responses['gad7'])
            if score is not None:
                result['scores']['anxiety'] = score
                result['severity']['anxiety'] = severity
                
                risk = self.risk_mapping.get(severity, 'low')
                if severity in ['moderate', 'severe']:
                    result['conditions_detected'].append('anxiety')
                
                if self._compare_risk(risk, max_risk) > 0:
                    max_risk = risk
        
        result['risk_level'] = max_risk
        result['recommendations_priority'] = self._get_priority_recommendations(result)
        
        return result
    
    def _compare_risk(self, risk1, risk2):
        """Compare two risk levels"""
        risk_order = {'low': 0, 'moderate': 1, 'high': 2}
        return risk_order.get(risk1, 0) - risk_order.get(risk2, 0)
    
    def _get_priority_recommendations(self, result):
        """Get priority recommendations based on detected conditions"""
        priorities = []
        
        if result['risk_level'] == 'high':
            priorities.append('immediate_professional_help')
            priorities.append('crisis_resources')
        elif result['risk_level'] == 'moderate':
            priorities.append('schedule_professional_consultation')
            priorities.append('self_care_strategies')
        
        if 'depression' in result['conditions_detected']:
            priorities.append('depression_coping_strategies')
        
        if 'anxiety' in result['conditions_detected']:
            priorities.append('anxiety_coping_strategies')
        
        if not priorities:
            priorities.append('maintain_wellness')
        
        return priorities
    
    def generate_combined_assessment(self, results):
        """
        Generate a combined assessment from multiple analysis sources
        
        Args:
            results: dict with 'questionnaire', 'text_analysis', and/or 'facial_emotion' keys
        
        Returns:
            dict with overall assessment
        """
        assessment = {
            'overall_risk': 'low',
            'confidence': 'medium',
            'concerns': [],
            'positive_indicators': [],
            'summary': ''
        }
        
        risk_scores = []
        
        # Process questionnaire results
        if 'questionnaire' in results:
            q = results['questionnaire']
            if 'risk_level' in q:
                risk_scores.append(self._risk_to_score(q['risk_level']))
            if 'conditions_detected' in q:
                assessment['concerns'].extend(q['conditions_detected'])
        
        # Process text analysis
        if 'text_analysis' in results:
            ta = results['text_analysis']
            if 'risk_level' in ta:
                risk_scores.append(self._risk_to_score(ta['risk_level']))
            if 'sentiment' in ta:
                sent = ta['sentiment']
                if sent.get('polarity', 0) > 0.2:
                    assessment['positive_indicators'].append('positive_language')
                elif sent.get('polarity', 0) < -0.2:
                    assessment['concerns'].append('negative_language')
        
        # Process facial emotion
        if 'facial_emotion' in results:
            emotion = results['facial_emotion']
            if emotion in ['sad', 'fearful', 'angry']:
                risk_scores.append(1)  # moderate indicator
                assessment['concerns'].append(f'{emotion}_facial_expression')
            elif emotion in ['happy']:
                risk_scores.append(0)
                assessment['positive_indicators'].append('positive_facial_expression')
        
        # Calculate overall risk
        if risk_scores:
            avg_risk = sum(risk_scores) / len(risk_scores)
            if avg_risk >= 1.5:
                assessment['overall_risk'] = 'high'
            elif avg_risk >= 0.8:
                assessment['overall_risk'] = 'moderate'
            else:
                assessment['overall_risk'] = 'low'
            
            # Confidence based on number of data sources
            if len(risk_scores) >= 3:
                assessment['confidence'] = 'high'
            elif len(risk_scores) >= 2:
                assessment['confidence'] = 'medium'
            else:
                assessment['confidence'] = 'low'
        
        # Generate summary
        assessment['summary'] = self._generate_summary(assessment)
        
        return assessment
    
    def _risk_to_score(self, risk_level):
        """Convert risk level to numeric score"""
        return {'low': 0, 'moderate': 1, 'high': 2}.get(risk_level, 0)
    
    def _generate_summary(self, assessment):
        """Generate a human-readable summary of the assessment"""
        risk = assessment['overall_risk']
        concerns = assessment['concerns']
        positives = assessment['positive_indicators']
        
        if risk == 'high':
            summary = "Your assessment indicates elevated mental health concerns. "
            summary += "We strongly recommend consulting with a mental health professional. "
        elif risk == 'moderate':
            summary = "Your assessment shows some areas of concern that may benefit from attention. "
            summary += "Consider speaking with a counselor or trying some of our recommended coping strategies. "
        else:
            summary = "Your assessment indicates generally positive mental well-being. "
            summary += "Continue maintaining your current wellness practices. "
        
        if concerns:
            formatted_concerns = [c.replace('_', ' ') for c in concerns[:3]]
            summary += f"Areas to focus on: {', '.join(formatted_concerns)}. "
        
        if positives:
            formatted_positives = [p.replace('_', ' ') for p in positives[:2]]
            summary += f"Positive aspects noted: {', '.join(formatted_positives)}."
        
        return summary
    
    def get_recommendations(self, data):
        """
        Get detailed recommendations based on assessment data
        
        Args:
            data: dict with risk_level, conditions, and scores
        
        Returns:
            dict with categorized recommendations
        """
        recommendations = {
            'immediate_actions': [],
            'self_care': [],
            'professional_resources': [],
            'coping_strategies': [],
            'lifestyle_changes': []
        }
        
        risk_level = data.get('risk_level', 'low')
        conditions = data.get('conditions', [])
        
        # High risk recommendations
        if risk_level == 'high':
            recommendations['immediate_actions'] = [
                {
                    'title': 'Seek Professional Help',
                    'description': 'Please consider reaching out to a mental health professional as soon as possible.',
                    'urgency': 'high'
                },
                {
                    'title': 'Crisis Support',
                    'description': 'If you are in crisis, please contact a helpline immediately.',
                    'resources': [
                        {'name': 'National Suicide Prevention Lifeline', 'contact': '988'},
                        {'name': 'Crisis Text Line', 'contact': 'Text HOME to 741741'}
                    ],
                    'urgency': 'critical'
                }
            ]
        
        # Depression-specific recommendations
        if 'depression' in conditions:
            recommendations['coping_strategies'].extend([
                {
                    'title': 'Behavioral Activation',
                    'description': 'Schedule small, enjoyable activities throughout your day, even if you do not feel like it.',
                    'steps': [
                        'Make a list of activities you used to enjoy',
                        'Start with just one 15-minute activity',
                        'Gradually increase activities over time'
                    ]
                },
                {
                    'title': 'Social Connection',
                    'description': 'Reach out to a friend, family member, or support group.',
                    'steps': [
                        'Send a simple message to someone you trust',
                        'Consider joining an online support community',
                        'Aim for at least one social interaction daily'
                    ]
                }
            ])
        
        # Anxiety-specific recommendations
        if 'anxiety' in conditions:
            recommendations['coping_strategies'].extend([
                {
                    'title': 'Grounding Techniques',
                    'description': 'Practice the 5-4-3-2-1 technique when feeling anxious.',
                    'steps': [
                        'Name 5 things you can see',
                        'Name 4 things you can touch',
                        'Name 3 things you can hear',
                        'Name 2 things you can smell',
                        'Name 1 thing you can taste'
                    ]
                },
                {
                    'title': 'Deep Breathing',
                    'description': 'Practice diaphragmatic breathing to activate your relaxation response.',
                    'steps': [
                        'Breathe in slowly for 4 seconds',
                        'Hold for 4 seconds',
                        'Exhale slowly for 6 seconds',
                        'Repeat 5-10 times'
                    ]
                }
            ])
        
        # General self-care recommendations
        recommendations['self_care'] = [
            {
                'title': 'Sleep Hygiene',
                'description': 'Maintain a consistent sleep schedule and create a restful environment.',
                'tips': ['Go to bed at the same time daily', 'Limit screen time before bed', 'Keep your bedroom cool and dark']
            },
            {
                'title': 'Physical Activity',
                'description': 'Regular exercise can significantly improve mood and reduce anxiety.',
                'tips': ['Start with 10-15 minutes of walking', 'Try yoga or stretching', 'Find activities you enjoy']
            },
            {
                'title': 'Mindfulness Practice',
                'description': 'Regular mindfulness can help manage stress and improve emotional regulation.',
                'tips': ['Start with 5 minutes of meditation', 'Try guided meditation apps', 'Practice mindful breathing']
            }
        ]
        
        # Professional resources
        recommendations['professional_resources'] = [
            {
                'title': 'Find a Therapist',
                'description': 'Consider working with a licensed mental health professional.',
                'resources': [
                    'Psychology Today Therapist Directory',
                    'SAMHSA National Helpline: 1-800-662-4357',
                    'Open Path Collective (affordable therapy)'
                ]
            },
            {
                'title': 'Online Therapy Options',
                'description': 'Teletherapy can be a convenient option for mental health support.',
                'note': 'Many services offer sliding scale fees based on income.'
            }
        ]
        
        return recommendations
