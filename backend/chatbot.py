"""
AI Chatbot Module for Mental Health Detection System

This module provides AI-powered chatbot functionality using:
- OpenAI GPT API (when API key is available)
- Fallback rule-based responses (when no API key)
"""
import os
import json
import re
import random

# Try to import OpenAI, but don't fail if not installed
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Get OpenAI API key from environment variable
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')


class MentalHealthChatbot:
    """
    AI-powered chatbot for mental health support.
    Uses OpenAI GPT when API key is available, otherwise falls back to rule-based responses.
    """
    
    def __init__(self):
        """Initialize the chatbot"""
        self.use_openai = OPENAI_AVAILABLE and OPENAI_API_KEY
        
        if self.use_openai:
            self.client = OpenAI(api_key=OPENAI_API_KEY)
            self.model = os.environ.get('OPENAI_MODEL', 'gpt-3.5-turbo')
        
        # System prompt for mental health support
        self.system_prompt = """You are MindfulAI, a compassionate and supportive mental health assistant. 
Your role is to:
1. Listen empathetically to users sharing their feelings
2. Provide supportive, non-judgmental responses
3. Offer evidence-based coping strategies and suggestions
4. Recognize signs of mental health concerns (anxiety, depression, stress)
5. Recommend professional help when appropriate
6. Never diagnose conditions - always suggest consulting professionals

Important guidelines:
- Be warm, understanding, and encouraging
- Use simple, clear language
- Validate feelings before offering suggestions
- For crisis situations, always provide helpline numbers (988 for US)
- Keep responses concise but helpful
- Ask follow-up questions to understand better

Remember: You are a supportive tool, not a replacement for professional mental health care."""

        # Rule-based response patterns (fallback)
        self._init_response_patterns()
    
    def _init_response_patterns(self):
        """Initialize rule-based response patterns"""
        self.response_patterns = {
            'greeting': {
                'keywords': ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon'],
                'responses': [
                    "Hello! I'm MindfulAI, your mental health support assistant. How are you feeling today?",
                    "Hi there! I'm here to listen and support you. What's on your mind?",
                    "Hello! I'm glad you're here. How can I help you today?"
                ]
            },
            'crisis': {
                'keywords': ['suicide', 'kill myself', 'end my life', 'want to die', 'harm myself', 'hurt myself'],
                'responses': [
                    "I'm really concerned about what you've shared. Your life matters, and there are people who want to help. 💙\n\n🆘 Please reach out immediately:\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/\n\nYou don't have to face this alone. Would you like to talk more about what's been happening?"
                ]
            },
            'anxiety': {
                'keywords': ['anxious', 'anxiety', 'worried', 'nervous', 'panic', 'scared', 'fear'],
                'responses': [
                    "I hear that you're experiencing anxiety. That can be really uncomfortable. 💭\n\nHere are some techniques that might help:\n\n• **Deep Breathing**: Try the 4-7-8 technique - breathe in for 4 seconds, hold for 7, exhale for 8\n• **Grounding**: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste\n• **Progressive Muscle Relaxation**: Tense and release each muscle group\n\nWould you like me to guide you through any of these exercises?",
                    "Anxiety can be really challenging to deal with. I want you to know that what you're feeling is valid. Some things that might help:\n\n1. Take slow, deep breaths\n2. Ground yourself by focusing on your surroundings\n3. Try to identify specific worries and write them down\n\nWhat's been triggering your anxiety lately?"
                ]
            },
            'depression': {
                'keywords': ['depressed', 'sad', 'hopeless', 'empty', 'worthless', 'tired all the time', 'no energy'],
                'responses': [
                    "I'm sorry to hear you're feeling this way. Your feelings are valid, and it takes courage to acknowledge them. 💙\n\nSome things that might help:\n\n• **Small steps**: Even a short walk or listening to music you love can help\n• **Connect**: Reach out to someone you trust, even just to say hi\n• **Self-compassion**: Treat yourself with the kindness you'd show a friend\n• **Professional support**: Consider speaking with a counselor if these feelings persist\n\nWould you like to tell me more about what's been making you feel this way?",
                    "I hear that you're going through a difficult time. Depression can make everything feel heavy and overwhelming. Remember that these feelings, while very real, are not permanent.\n\nSome gentle suggestions:\n- Try to maintain small routines\n- Allow yourself to feel without judgment\n- Consider reaching out to a mental health professional\n\nWhat has been the hardest part for you lately?"
                ]
            },
            'stress': {
                'keywords': ['stressed', 'overwhelmed', 'pressure', 'too much', 'exhausted', 'burned out'],
                'responses': [
                    "Stress can feel really overwhelming. Let's work through this together. 🌟\n\n**Immediate relief:**\n• Take 3 slow, deep breaths right now\n• Step away from what's stressing you for 5 minutes\n• Splash some cool water on your face\n\n**Longer-term strategies:**\n• Break big tasks into smaller, manageable steps\n• Prioritize and let go of what's not essential\n• Make time for activities you enjoy\n• Consider setting boundaries\n\nWhat's the main source of your stress right now?",
                    "Being overwhelmed is exhausting. You're dealing with a lot, and it's okay to acknowledge that. Here are some things that might help:\n\n1. Write down what's on your plate\n2. Identify what's urgent vs. important\n3. Ask for help where possible\n4. Build in breaks, even short ones\n\nWould you like to talk about what's causing the most pressure?"
                ]
            },
            'sleep': {
                'keywords': ['sleep', 'insomnia', "can't sleep", 'nightmares', 'tired'],
                'responses': [
                    "Sleep problems can really affect how we feel. Here are some evidence-based tips:\n\n**Sleep Hygiene:**\n• Keep a consistent sleep schedule, even on weekends\n• Avoid screens 1 hour before bed\n• Keep your bedroom cool and dark\n• Limit caffeine after noon\n\n**Relaxation:**\n• Try a body scan meditation before bed\n• Progressive muscle relaxation\n• Calming music or white noise\n\nHow long have you been having trouble sleeping?"
                ]
            },
            'lonely': {
                'keywords': ['lonely', 'alone', 'isolated', 'no friends', 'nobody cares'],
                'responses': [
                    "Feeling lonely can be really painful, and it's more common than you might think. 💙\n\n**Ways to connect:**\n• Reach out to an old friend or family member\n• Join a community group or class\n• Volunteer for a cause you care about\n• Consider online communities around your interests\n\n**Self-connection:**\n• Spend time doing activities you enjoy\n• Practice self-compassion\n• Remember that being alone and feeling lonely are different\n\nWould you like to talk about what's contributing to these feelings?"
                ]
            },
            'gratitude': {
                'keywords': ['thank', 'thanks', 'grateful', 'appreciate'],
                'responses': [
                    "You're welcome! 😊 Remember, taking time to check in with yourself is an important step in maintaining mental wellness. Is there anything else I can help you with?",
                    "I'm glad I could help! Taking care of your mental health is important, and I'm here whenever you need support."
                ]
            },
            'goodbye': {
                'keywords': ['bye', 'goodbye', 'see you', 'talk later'],
                'responses': [
                    "Take care of yourself! Remember, you can always come back when you need someone to talk to. 💙 Stay well!",
                    "Goodbye! Remember to be kind to yourself. I'm here whenever you need support."
                ]
            },
            'help': {
                'keywords': ['help', 'what can you do', 'how do you work'],
                'responses': [
                    "I'm here to support your mental well-being! Here's how I can help:\n\n🗣️ **Talk**: Share your feelings and concerns\n💡 **Suggestions**: Get coping strategies and tips\n😊 **Techniques**: Learn relaxation and mindfulness exercises\n📊 **Track**: I analyze our conversations to provide personalized insights\n📄 **Reports**: Generate a summary of your mental health journey\n\nWhat would you like to focus on today?"
                ]
            }
        }
        
        # Default responses when no pattern matches
        self.default_responses = [
            "Thank you for sharing that with me. I'm here to listen. Can you tell me more about how that makes you feel?",
            "I appreciate you opening up. It takes courage to talk about these things. What else is on your mind?",
            "I hear you. Your feelings are valid. Would you like to explore some coping strategies together?",
            "It sounds like you're going through a lot. Remember, it's okay to take things one step at a time. What would help you most right now?",
            "Thank you for trusting me with this. How have you been coping with these feelings so far?"
        ]
    
    def get_response(self, user_message, chat_history=None, user_name=None):
        """
        Generate a response to the user's message
        
        Args:
            user_message: str - The user's message
            chat_history: list - Previous messages in the conversation
            user_name: str - User's name for personalization
        
        Returns:
            dict with response text and detected emotions/topics
        """
        if not user_message or not user_message.strip():
            return {
                'response': "I didn't catch that. Could you please share what's on your mind?",
                'emotions': [],
                'topics': [],
                'risk_level': 'low'
            }
        
        # Analyze the user message
        analysis = self._analyze_message(user_message)
        
        # Generate response
        if self.use_openai:
            response_text = self._get_openai_response(user_message, chat_history, user_name)
        else:
            response_text = self._get_rule_based_response(user_message, user_name, analysis)
        
        return {
            'response': response_text,
            'emotions': analysis['emotions'],
            'topics': analysis['topics'],
            'risk_level': analysis['risk_level']
        }
    
    def _get_openai_response(self, user_message, chat_history=None, user_name=None):
        """Get response from OpenAI API"""
        try:
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Add chat history for context
            if chat_history:
                for msg in chat_history[-10:]:  # Last 10 messages for context
                    role = "user" if msg.get('role') == 'user' else "assistant"
                    messages.append({"role": role, "content": msg.get('content', '')})
            
            # Add current user message
            if user_name:
                user_message = f"(User's name is {user_name}) {user_message}"
            messages.append({"role": "user", "content": user_message})
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            # Fallback to rule-based on error
            print(f"OpenAI API error: {e}")
            return self._get_rule_based_response(user_message, user_name, self._analyze_message(user_message))
    
    def _get_rule_based_response(self, user_message, user_name=None, analysis=None):
        """Get rule-based response"""
        lower_message = user_message.lower()
        
        # Check for crisis first
        for keyword in self.response_patterns['crisis']['keywords']:
            if keyword in lower_message:
                return self.response_patterns['crisis']['responses'][0]
        
        # Check other patterns
        for pattern_name, pattern_data in self.response_patterns.items():
            if pattern_name == 'crisis':
                continue
            for keyword in pattern_data['keywords']:
                if keyword in lower_message:
                    response = random.choice(pattern_data['responses'])
                    if user_name and pattern_name == 'greeting':
                        response = response.replace("Hello!", f"Hello {user_name}!")
                        response = response.replace("Hi there!", f"Hi {user_name}!")
                    return response
        
        # Default response
        return random.choice(self.default_responses)
    
    def _analyze_message(self, message):
        """Analyze message for emotions, topics, and risk level"""
        lower_message = message.lower()
        
        emotions = []
        topics = []
        risk_level = 'low'
        
        # Detect emotions
        emotion_keywords = {
            'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good'],
            'sad': ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'crying'],
            'anxious': ['anxious', 'worried', 'nervous', 'scared', 'panic', 'fear'],
            'stressed': ['stressed', 'overwhelmed', 'pressure', 'exhausted', 'tired'],
            'angry': ['angry', 'frustrated', 'annoyed', 'mad', 'irritated'],
            'lonely': ['lonely', 'alone', 'isolated', 'nobody', 'no one']
        }
        
        for emotion, keywords in emotion_keywords.items():
            for keyword in keywords:
                if keyword in lower_message:
                    if emotion not in emotions:
                        emotions.append(emotion)
                    break
        
        # Detect topics
        topic_keywords = {
            'work': ['work', 'job', 'boss', 'colleague', 'career', 'office'],
            'relationships': ['relationship', 'partner', 'friend', 'family', 'marriage'],
            'health': ['health', 'sleep', 'eating', 'exercise', 'body'],
            'self_esteem': ['confident', 'worth', 'value', 'myself', 'self-esteem'],
            'future': ['future', 'goals', 'plans', 'worry about']
        }
        
        for topic, keywords in topic_keywords.items():
            for keyword in keywords:
                if keyword in lower_message:
                    if topic not in topics:
                        topics.append(topic)
                    break
        
        # Determine risk level
        high_risk_keywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'harm myself']
        moderate_risk_keywords = ['hopeless', 'worthless', 'no point', 'give up', 'can\'t go on']
        
        for keyword in high_risk_keywords:
            if keyword in lower_message:
                risk_level = 'high'
                break
        
        if risk_level != 'high':
            for keyword in moderate_risk_keywords:
                if keyword in lower_message:
                    risk_level = 'moderate'
                    break
        
        return {
            'emotions': emotions,
            'topics': topics,
            'risk_level': risk_level
        }
    
    def is_using_ai(self):
        """Check if using OpenAI API"""
        return self.use_openai
    
    def get_api_status(self):
        """Get API status information"""
        return {
            'openai_available': OPENAI_AVAILABLE,
            'api_key_configured': bool(OPENAI_API_KEY),
            'using_ai': self.use_openai,
            'model': self.model if self.use_openai else 'rule-based'
        }
