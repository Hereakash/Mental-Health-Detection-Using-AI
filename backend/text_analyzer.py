"""
Text Analyzer Module

This module implements NLP-based sentiment analysis and mental health
indicator detection from text input.
"""
import re
from collections import Counter


class TextAnalyzer:
    """
    Text analysis for mental health indicator detection using
    sentiment analysis and linguistic pattern matching.
    """
    
    def __init__(self):
        """Initialize the analyzer with mental health keywords and patterns"""
        
        # Depression indicators
        self.depression_keywords = {
            'high': ['suicidal', 'suicide', 'kill myself', 'end my life', 'want to die', 
                     'better off dead', 'no reason to live', 'worthless', 'hopeless'],
            'moderate': ['depressed', 'depression', 'sad all the time', 'empty', 'numb',
                        'no energy', 'tired all the time', 'exhausted', 'guilty', 
                        'hate myself', 'failure', 'useless', 'burden'],
            'mild': ['sad', 'down', 'unhappy', 'low', 'unmotivated', 'lonely',
                    'isolated', 'tired', 'bored', 'disappointed']
        }
        
        # Anxiety indicators
        self.anxiety_keywords = {
            'high': ['panic attack', 'cannot breathe', 'terrified', 'paralyzed with fear',
                    'heart racing', 'going to die', 'losing control', 'going crazy'],
            'moderate': ['anxious', 'anxiety', 'worried constantly', 'nervous', 'scared',
                        'fear', 'restless', 'on edge', 'tense', 'cannot relax', 
                        'overthinking', 'catastrophizing'],
            'mild': ['worried', 'nervous', 'uneasy', 'stressed', 'overwhelmed',
                    'uncertain', 'apprehensive']
        }
        
        # Stress indicators
        self.stress_keywords = {
            'high': ['breaking down', 'cannot cope', 'falling apart', 'at my limit',
                    'burned out', 'completely overwhelmed'],
            'moderate': ['stressed', 'pressure', 'too much', 'cannot handle', 
                        'overworked', 'exhausted', 'drained'],
            'mild': ['busy', 'hectic', 'demanding', 'challenging', 'tight deadline']
        }
        
        # Positive indicators
        self.positive_keywords = [
            'happy', 'grateful', 'thankful', 'blessed', 'excited', 'hopeful',
            'optimistic', 'content', 'peaceful', 'calm', 'relaxed', 'joyful',
            'motivated', 'energetic', 'confident', 'proud', 'loved', 'supported',
            'better', 'improving', 'progress', 'good', 'great', 'wonderful'
        ]
        
        # Negation words that can flip sentiment
        self.negation_words = ['not', 'no', 'never', 'neither', 'nobody', 'nothing',
                              'nowhere', 'hardly', 'barely', 'scarcely', "don't", 
                              "doesn't", "didn't", "won't", "wouldn't", "couldn't",
                              "shouldn't", "can't", "cannot", "isn't", "aren't"]
        
        # Simple sentiment word lists
        self.positive_sentiment_words = [
            'love', 'like', 'enjoy', 'appreciate', 'wonderful', 'amazing', 'excellent',
            'great', 'good', 'nice', 'beautiful', 'awesome', 'fantastic', 'perfect',
            'happy', 'glad', 'pleased', 'delighted', 'thrilled', 'excited', 'grateful'
        ]
        
        self.negative_sentiment_words = [
            'hate', 'dislike', 'terrible', 'awful', 'horrible', 'bad', 'worst',
            'sad', 'angry', 'frustrated', 'annoyed', 'disappointed', 'upset',
            'hurt', 'pain', 'suffer', 'struggle', 'difficult', 'hard', 'problem'
        ]
    
    def analyze(self, text):
        """
        Analyze text for sentiment and mental health indicators
        
        Args:
            text: str - User's text input
        
        Returns:
            dict with sentiment scores, detected indicators, and risk assessment
        """
        if not text or not isinstance(text, str):
            return {'error': 'Invalid text input'}
        
        # Preprocess text
        processed_text = self._preprocess(text)
        words = processed_text.split()
        
        # Calculate sentiment
        sentiment = self._calculate_sentiment(processed_text, words)
        
        # Detect mental health indicators
        indicators = self._detect_indicators(processed_text)
        
        # Calculate risk level
        risk_level = self._calculate_risk_level(indicators, sentiment)
        
        # Generate insights
        insights = self._generate_insights(indicators, sentiment, risk_level)
        
        return {
            'sentiment': sentiment,
            'indicators': indicators,
            'risk_level': risk_level,
            'insights': insights,
            'word_count': len(words),
            'concerns_detected': self._get_concerns_list(indicators)
        }
    
    def _preprocess(self, text):
        """Preprocess text for analysis"""
        # Convert to lowercase
        text = text.lower()
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text
    
    def _calculate_sentiment(self, text, words):
        """
        Calculate sentiment scores using a simple lexicon-based approach
        
        Returns:
            dict with polarity and subjectivity scores
        """
        positive_count = 0
        negative_count = 0
        
        # Check for negation context
        negation_active = False
        
        for i, word in enumerate(words):
            # Check if this is a negation word
            if word in self.negation_words:
                negation_active = True
                continue
            
            # Check sentiment
            is_positive = word in self.positive_sentiment_words
            is_negative = word in self.negative_sentiment_words
            
            # Apply negation
            if negation_active:
                is_positive, is_negative = is_negative, is_positive
                negation_active = False
            
            if is_positive:
                positive_count += 1
            if is_negative:
                negative_count += 1
        
        total_sentiment_words = positive_count + negative_count
        
        if total_sentiment_words == 0:
            polarity = 0
        else:
            polarity = (positive_count - negative_count) / total_sentiment_words
        
        # Subjectivity based on proportion of sentiment words
        word_count = len(words)
        if word_count == 0:
            subjectivity = 0
        else:
            subjectivity = min(1.0, total_sentiment_words / word_count * 2)
        
        return {
            'polarity': round(polarity, 3),
            'subjectivity': round(subjectivity, 3),
            'positive_words': positive_count,
            'negative_words': negative_count,
            'interpretation': self._interpret_sentiment(polarity)
        }
    
    def _interpret_sentiment(self, polarity):
        """Interpret sentiment polarity score"""
        if polarity >= 0.3:
            return 'positive'
        elif polarity <= -0.3:
            return 'negative'
        else:
            return 'neutral'
    
    def _detect_indicators(self, text):
        """
        Detect mental health indicators in text
        
        Returns:
            dict with detected indicators for each condition
        """
        indicators = {
            'depression': {'level': 'none', 'keywords_found': []},
            'anxiety': {'level': 'none', 'keywords_found': []},
            'stress': {'level': 'none', 'keywords_found': []},
            'positive': {'keywords_found': []}
        }
        
        # Use word boundary matching for accurate detection
        import re
        
        def find_keyword_matches(text, keyword):
            """Find keyword with word boundary matching"""
            # For multi-word phrases, match directly
            if ' ' in keyword:
                return keyword in text
            # For single words, use word boundary
            pattern = r'\b' + re.escape(keyword) + r'\b'
            return bool(re.search(pattern, text))
        
        # Check depression keywords
        for level, keywords in self.depression_keywords.items():
            for keyword in keywords:
                if find_keyword_matches(text, keyword):
                    indicators['depression']['keywords_found'].append(keyword)
                    if indicators['depression']['level'] == 'none' or \
                       self._level_priority(level) > self._level_priority(indicators['depression']['level']):
                        indicators['depression']['level'] = level
        
        # Check anxiety keywords
        for level, keywords in self.anxiety_keywords.items():
            for keyword in keywords:
                if find_keyword_matches(text, keyword):
                    indicators['anxiety']['keywords_found'].append(keyword)
                    if indicators['anxiety']['level'] == 'none' or \
                       self._level_priority(level) > self._level_priority(indicators['anxiety']['level']):
                        indicators['anxiety']['level'] = level
        
        # Check stress keywords
        for level, keywords in self.stress_keywords.items():
            for keyword in keywords:
                if find_keyword_matches(text, keyword):
                    indicators['stress']['keywords_found'].append(keyword)
                    if indicators['stress']['level'] == 'none' or \
                       self._level_priority(level) > self._level_priority(indicators['stress']['level']):
                        indicators['stress']['level'] = level
        
        # Check positive keywords
        for keyword in self.positive_keywords:
            if find_keyword_matches(text, keyword):
                indicators['positive']['keywords_found'].append(keyword)
        
        return indicators
    
    def _level_priority(self, level):
        """Get priority score for indicator level"""
        return {'none': 0, 'mild': 1, 'moderate': 2, 'high': 3}.get(level, 0)
    
    def _calculate_risk_level(self, indicators, sentiment):
        """
        Calculate overall risk level based on indicators and sentiment
        
        Returns:
            str: 'low', 'moderate', or 'high'
        """
        # Check for high-risk indicators first
        if indicators['depression']['level'] == 'high' or \
           indicators['anxiety']['level'] == 'high':
            return 'high'
        
        # Check for moderate indicators
        moderate_count = 0
        for condition in ['depression', 'anxiety', 'stress']:
            if indicators[condition]['level'] in ['moderate', 'high']:
                moderate_count += 1
        
        if moderate_count >= 2 or \
           (moderate_count == 1 and sentiment['polarity'] < -0.3):
            return 'moderate'
        
        # Check for mild indicators with negative sentiment
        mild_count = 0
        for condition in ['depression', 'anxiety', 'stress']:
            if indicators[condition]['level'] == 'mild':
                mild_count += 1
        
        if mild_count >= 2 and sentiment['polarity'] < 0:
            return 'moderate'
        
        if moderate_count > 0 or (mild_count > 0 and sentiment['polarity'] < -0.2):
            return 'low'
        
        return 'low'
    
    def _generate_insights(self, indicators, sentiment, risk_level):
        """Generate human-readable insights from the analysis"""
        insights = []
        
        # Sentiment insight
        if sentiment['interpretation'] == 'positive':
            insights.append({
                'type': 'positive',
                'message': 'Your text expresses generally positive emotions and outlook.'
            })
        elif sentiment['interpretation'] == 'negative':
            insights.append({
                'type': 'concern',
                'message': 'Your text reflects some negative emotions. This is normal to experience sometimes.'
            })
        
        # Depression indicators
        if indicators['depression']['level'] != 'none':
            level = indicators['depression']['level']
            if level == 'high':
                insights.append({
                    'type': 'urgent',
                    'message': 'We detected some concerning expressions in your text. Please consider speaking with a mental health professional.'
                })
            elif level == 'moderate':
                insights.append({
                    'type': 'concern',
                    'message': 'Your text suggests you may be experiencing some feelings of sadness or low mood.'
                })
        
        # Anxiety indicators
        if indicators['anxiety']['level'] != 'none':
            level = indicators['anxiety']['level']
            if level in ['high', 'moderate']:
                insights.append({
                    'type': 'concern',
                    'message': 'Your text indicates you may be experiencing anxiety or worry. Relaxation techniques may help.'
                })
        
        # Stress indicators
        if indicators['stress']['level'] != 'none':
            level = indicators['stress']['level']
            if level in ['high', 'moderate']:
                insights.append({
                    'type': 'concern',
                    'message': 'You seem to be experiencing stress. Consider taking breaks and practicing self-care.'
                })
        
        # Positive indicators
        if len(indicators['positive']['keywords_found']) >= 3:
            insights.append({
                'type': 'positive',
                'message': 'You are expressing several positive emotions and thoughts. Keep nurturing these feelings!'
            })
        
        if not insights:
            insights.append({
                'type': 'neutral',
                'message': 'Your text appears emotionally balanced. Continue monitoring how you feel.'
            })
        
        return insights
    
    def _get_concerns_list(self, indicators):
        """Get a list of detected concerns"""
        concerns = []
        
        for condition in ['depression', 'anxiety', 'stress']:
            if indicators[condition]['level'] in ['moderate', 'high']:
                concerns.append(condition)
        
        return concerns
