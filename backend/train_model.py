#!/usr/bin/env python3
"""
Standalone Model Training Script for Mental Health Detection

This script allows you to train machine learning models for mental health risk prediction.
It can be used with custom datasets or the built-in sample dataset.

Usage:
    # Train with sample data
    python train_model.py
    
    # Train with custom data
    python train_model.py --data dataset.csv
    
    # Train with specific model type
    python train_model.py --model random_forest
    
    # Train with custom data and model type
    python train_model.py --data dataset.csv --model gradient_boosting
"""

import argparse
import sys
import csv
import json
from pathlib import Path
from ml_model import MentalHealthMLModel


def load_dataset_from_csv(filepath):
    """
    Load dataset from CSV file.
    
    Expected CSV format:
    text,label
    "I'm feeling great today",low
    "I've been feeling down lately",moderate
    "I feel hopeless",high
    
    Args:
        filepath: Path to CSV file
    
    Returns:
        tuple: (texts, labels)
    """
    texts = []
    labels = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Validate headers
            if 'text' not in reader.fieldnames or 'label' not in reader.fieldnames:
                raise ValueError("CSV must have 'text' and 'label' columns")
            
            for row in reader:
                text = row['text'].strip()
                label = row['label'].strip().lower()
                
                # Validate label
                if label not in ['low', 'moderate', 'high']:
                    print(f"Warning: Skipping row with invalid label '{label}'. Must be 'low', 'moderate', or 'high'")
                    continue
                
                if text:
                    texts.append(text)
                    labels.append(label)
        
        print(f"Loaded {len(texts)} samples from {filepath}")
        return texts, labels
    
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error loading dataset: {e}")
        sys.exit(1)


def print_training_results(results):
    """Print formatted training results"""
    print("\n" + "="*60)
    print("TRAINING RESULTS")
    print("="*60)
    
    if not results.get('success'):
        print(f"❌ Training failed: {results.get('error', 'Unknown error')}")
        return
    
    print(f"✅ Training completed successfully!")
    print(f"\nModel Type: {results['model_type']}")
    print(f"Training Samples: {results['training_samples']}")
    print(f"Test Samples: {results['test_samples']}")
    print(f"\nPerformance Metrics:")
    print(f"  Accuracy: {results['accuracy']:.2%}")
    print(f"  F1 Score: {results['f1_score']:.4f}")
    print(f"  Cross-validation Mean: {results['cross_val_mean']:.4f}")
    print(f"  Cross-validation Std: {results['cross_val_std']:.4f}")
    
    print(f"\nPer-class Performance:")
    report = results.get('classification_report', {})
    for label in ['low', 'moderate', 'high']:
        if label in report:
            metrics = report[label]
            print(f"\n  {label.upper()}:")
            print(f"    Precision: {metrics['precision']:.2%}")
            print(f"    Recall: {metrics['recall']:.2%}")
            print(f"    F1-Score: {metrics['f1-score']:.4f}")
            print(f"    Support: {int(metrics['support'])} samples")
    
    print("\n" + "="*60)


def test_model(model, test_texts=None):
    """Test the trained model with example predictions"""
    print("\n" + "="*60)
    print("MODEL TESTING")
    print("="*60)
    
    if test_texts is None:
        test_texts = [
            "I'm feeling happy and optimistic about life",
            "I've been feeling anxious and worried lately",
            "I feel completely hopeless and don't want to go on"
        ]
    
    print("\nTesting model with example texts:\n")
    
    for text in test_texts:
        result = model.predict(text)
        print(f"Text: \"{text[:60]}{'...' if len(text) > 60 else ''}\"")
        if 'error' in result:
            print(f"  Error: {result['error']}\n")
        else:
            print(f"  Predicted Risk: {result['risk_level'].upper()}")
            print(f"  Confidence: {result['confidence']:.2%}")
            print(f"  Probabilities:")
            for level, prob in result['probabilities'].items():
                print(f"    {level}: {prob:.2%}")
        print()
    
    print("="*60)


def main():
    parser = argparse.ArgumentParser(
        description='Train mental health risk prediction model',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Train with built-in sample dataset
  python train_model.py
  
  # Train with custom dataset
  python train_model.py --data my_dataset.csv
  
  # Train with Random Forest algorithm
  python train_model.py --model random_forest
  
  # Train with custom data and specific algorithm
  python train_model.py --data my_dataset.csv --model gradient_boosting
  
  # Skip testing after training
  python train_model.py --no-test

Supported model types:
  - logistic_regression (default, fast and interpretable)
  - random_forest (ensemble method, robust)
  - gradient_boosting (high accuracy, slower training)

Dataset Format (CSV):
  The CSV file must have two columns: 'text' and 'label'
  Labels must be: 'low', 'moderate', or 'high'
  
  Example:
    text,label
    "I feel great today",low
    "I'm worried about things",moderate
    "I feel hopeless",high
        """
    )
    
    parser.add_argument(
        '--data', '-d',
        type=str,
        help='Path to training dataset CSV file (optional, uses sample data if not provided)'
    )
    
    parser.add_argument(
        '--model', '-m',
        type=str,
        choices=['logistic_regression', 'random_forest', 'gradient_boosting'],
        default='logistic_regression',
        help='Type of model to train (default: logistic_regression)'
    )
    
    parser.add_argument(
        '--test-size',
        type=float,
        default=0.2,
        help='Proportion of data for testing (default: 0.2)'
    )
    
    parser.add_argument(
        '--no-test',
        action='store_true',
        help='Skip testing the model after training'
    )
    
    parser.add_argument(
        '--test-texts',
        type=str,
        nargs='+',
        help='Custom texts to test the model with'
    )
    
    args = parser.parse_args()
    
    print("="*60)
    print("MENTAL HEALTH RISK PREDICTION - MODEL TRAINING")
    print("="*60)
    
    # Initialize model
    print("\nInitializing model...")
    model = MentalHealthMLModel()
    
    # Load dataset
    texts = None
    labels = None
    
    if args.data:
        print(f"\nLoading dataset from: {args.data}")
        texts, labels = load_dataset_from_csv(args.data)
        
        if len(texts) < 10:
            print("Error: Dataset too small. Need at least 10 samples for training.")
            sys.exit(1)
        
        # Print dataset statistics
        label_counts = {}
        for label in labels:
            label_counts[label] = label_counts.get(label, 0) + 1
        
        print(f"\nDataset Statistics:")
        print(f"  Total samples: {len(texts)}")
        for label in ['low', 'moderate', 'high']:
            count = label_counts.get(label, 0)
            percentage = (count / len(texts)) * 100
            print(f"  {label.capitalize()}: {count} ({percentage:.1f}%)")
    else:
        print("\nNo dataset provided. Using built-in sample dataset...")
        print("(Use --data <file.csv> to train with your own data)")
    
    # Train model
    print(f"\nTraining {args.model} model...")
    print("This may take a few moments...\n")
    
    try:
        results = model.train(
            texts=texts,
            labels=labels,
            model_type=args.model,
            test_size=args.test_size
        )
        
        # Print results
        print_training_results(results)
        
        # Test model
        if not args.no_test:
            test_model(model, args.test_texts)
        
        print("\n✅ Model saved successfully!")
        print(f"Model location: {Path('models/mental_health_model.joblib').absolute()}")
        print("\nYou can now use this model via the API endpoints:")
        print("  POST /api/model/predict - Make predictions")
        print("  GET /api/model/info - Get model information")
        
    except Exception as e:
        print(f"\n❌ Training failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
