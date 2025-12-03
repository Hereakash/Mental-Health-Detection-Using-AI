"""
Machine Learning Model Training Module for Mental Health Detection

This module provides functionality for:
- Training ML models on mental health datasets
- Model persistence and loading
- Predictions using trained models
"""
import os
import json
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.pipeline import Pipeline
import joblib

# Model storage path
MODEL_DIR = os.environ.get('MODEL_DIR', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'mental_health_model.joblib')
VECTORIZER_PATH = os.path.join(MODEL_DIR, 'vectorizer.joblib')


class MentalHealthMLModel:
    """
    Machine Learning model for mental health risk prediction from text.
    Supports multiple algorithms: Logistic Regression, Random Forest, Gradient Boosting.
    """
    
    def __init__(self):
        """Initialize the ML model"""
        self.model = None
        self.vectorizer = None
        self.is_trained = False
        self.model_type = None
        self.classes = ['low', 'moderate', 'high']
        
        # Ensure model directory exists
        os.makedirs(MODEL_DIR, exist_ok=True)
        
        # Try to load existing model
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model if available"""
        try:
            if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.vectorizer = joblib.load(VECTORIZER_PATH)
                self.is_trained = True
                print("Loaded pre-trained model successfully")
        except Exception as e:
            print(f"Could not load model: {e}")
            self.is_trained = False
    
    def _save_model(self):
        """Save trained model to disk"""
        try:
            joblib.dump(self.model, MODEL_PATH)
            joblib.dump(self.vectorizer, VECTORIZER_PATH)
            print(f"Model saved to {MODEL_PATH}")
        except Exception as e:
            print(f"Error saving model: {e}")
    
    def create_sample_dataset(self):
        """
        Create a sample dataset for training.
        In production, this should be replaced with real mental health datasets
        like DAIC-WOZ, CLPsych, or collected data.
        """
        # Sample training data with mental health-related texts
        texts = [
            # Low risk samples
            "I had a great day today and feel really happy",
            "Everything is going well in my life",
            "I'm feeling good and optimistic about the future",
            "I enjoyed spending time with friends today",
            "Work is going smoothly and I feel accomplished",
            "I'm grateful for the support I have from family",
            "I've been sleeping well and have good energy",
            "I'm excited about my upcoming plans",
            "I feel content and at peace with life",
            "Today was productive and I feel satisfied",
            "I'm looking forward to the weekend",
            "I feel balanced and centered",
            "My mood has been stable and positive",
            "I'm handling stress well lately",
            "Life feels manageable right now",
            
            # Moderate risk samples
            "I've been feeling a bit down lately",
            "Sometimes I feel stressed and overwhelmed",
            "I'm worried about several things in my life",
            "Sleep hasn't been great this week",
            "I feel anxious about the future sometimes",
            "Work pressure is getting to me",
            "I'm struggling to stay motivated",
            "I feel lonely sometimes",
            "My mood has been up and down recently",
            "I'm finding it hard to relax",
            "I've been more irritable than usual",
            "I'm having trouble concentrating",
            "I feel uncertain about things",
            "Social situations make me nervous",
            "I'm not as happy as I used to be",
            "I've been feeling tired a lot",
            "I'm worried about my relationships",
            "Sometimes I feel empty inside",
            "I'm dealing with some difficult emotions",
            "I feel like I'm not good enough sometimes",
            
            # High risk samples
            "I feel completely hopeless about everything",
            "I don't see any point in going on",
            "I feel worthless and like a burden to everyone",
            "I've been having thoughts of harming myself",
            "Nothing brings me joy anymore",
            "I feel like I'm in a very dark place",
            "I've lost interest in everything I used to enjoy",
            "I feel trapped and can't see a way out",
            "Every day feels like a struggle to survive",
            "I feel disconnected from everyone around me",
            "I can't imagine things ever getting better",
            "I'm exhausted from trying to cope",
            "I feel like giving up on everything",
            "I have no energy or motivation to do anything",
            "I've been crying every day and feel desperate"
        ]
        
        labels = (
            ['low'] * 15 +
            ['moderate'] * 20 +
            ['high'] * 15
        )
        
        return texts, labels
    
    def train(self, texts=None, labels=None, model_type='logistic_regression', test_size=0.2):
        """
        Train the machine learning model
        
        Args:
            texts: list of text samples (optional, uses sample data if None)
            labels: list of labels ('low', 'moderate', 'high')
            model_type: 'logistic_regression', 'random_forest', or 'gradient_boosting'
            test_size: proportion of data for testing
        
        Returns:
            dict with training results and metrics
        """
        # Use sample dataset if no data provided
        if texts is None or labels is None:
            texts, labels = self.create_sample_dataset()
        
        # Validate inputs
        if len(texts) != len(labels):
            raise ValueError("Number of texts must match number of labels")
        
        if len(texts) < 10:
            raise ValueError("Need at least 10 samples for training")
        
        # Create TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words='english',
            min_df=1,
            max_df=0.95
        )
        
        # Transform texts
        X = self.vectorizer.fit_transform(texts)
        y = np.array(labels)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # Create model based on type
        if model_type == 'logistic_regression':
            self.model = LogisticRegression(
                max_iter=1000,
                solver='lbfgs',
                random_state=42
            )
        elif model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        elif model_type == 'gradient_boosting':
            self.model = GradientBoostingClassifier(
                n_estimators=100,
                max_depth=5,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {model_type}")
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X, y, cv=min(5, len(set(y))))
        
        # Classification report
        report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        
        self.is_trained = True
        self.model_type = model_type
        
        # Save model
        self._save_model()
        
        return {
            'success': True,
            'model_type': model_type,
            'accuracy': round(accuracy, 4),
            'f1_score': round(f1, 4),
            'cross_val_mean': round(cv_scores.mean(), 4),
            'cross_val_std': round(cv_scores.std(), 4),
            'classification_report': report,
            'training_samples': X_train.shape[0],
            'test_samples': X_test.shape[0]
        }
    
    def predict(self, text):
        """
        Predict mental health risk from text
        
        Args:
            text: str - User's text input
        
        Returns:
            dict with prediction results
        """
        if not self.is_trained:
            return {
                'error': 'Model not trained. Please train the model first.',
                'fallback': True,
                'risk_level': 'unknown'
            }
        
        try:
            # Transform text
            X = self.vectorizer.transform([text])
            
            # Get prediction and probabilities
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            
            # Create probability dict
            prob_dict = {}
            for i, cls in enumerate(self.model.classes_):
                prob_dict[cls] = round(float(probabilities[i]), 4)
            
            return {
                'risk_level': prediction,
                'confidence': round(float(max(probabilities)), 4),
                'probabilities': prob_dict,
                'model_type': self.model_type
            }
        except Exception as e:
            return {
                'error': str(e),
                'fallback': True,
                'risk_level': 'unknown'
            }
    
    def predict_batch(self, texts):
        """
        Predict mental health risk for multiple texts
        
        Args:
            texts: list of strings
        
        Returns:
            list of prediction results
        """
        return [self.predict(text) for text in texts]
    
    def get_model_info(self):
        """Get information about the current model"""
        feature_count = 0
        if self.vectorizer:
            try:
                feature_count = len(self.vectorizer.get_feature_names_out())
            except AttributeError:
                # Fallback for older scikit-learn versions
                try:
                    feature_count = len(self.vectorizer.get_feature_names())
                except Exception:
                    feature_count = 0
        
        return {
            'is_trained': self.is_trained,
            'model_type': self.model_type if self.is_trained else None,
            'classes': self.classes,
            'model_path': MODEL_PATH if self.is_trained else None,
            'feature_count': feature_count
        }
    
    def retrain_with_new_data(self, new_texts, new_labels, existing_texts=None, existing_labels=None):
        """
        Retrain model with new data, optionally combining with existing data
        
        Args:
            new_texts: list of new text samples
            new_labels: list of new labels
            existing_texts: list of existing text samples (optional)
            existing_labels: list of existing labels (optional)
        
        Returns:
            dict with retraining results
        """
        # Combine data if existing provided
        if existing_texts and existing_labels:
            all_texts = existing_texts + new_texts
            all_labels = existing_labels + new_labels
        else:
            # Use sample data + new data
            sample_texts, sample_labels = self.create_sample_dataset()
            all_texts = sample_texts + new_texts
            all_labels = sample_labels + new_labels
        
        # Retrain
        return self.train(all_texts, all_labels, model_type=self.model_type or 'logistic_regression')


# Global model instance
_model_instance = None


def get_model():
    """Get or create the global model instance"""
    global _model_instance
    if _model_instance is None:
        _model_instance = MentalHealthMLModel()
    return _model_instance
