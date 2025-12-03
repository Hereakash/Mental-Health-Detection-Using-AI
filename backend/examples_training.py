#!/usr/bin/env python3
"""
Example Script: Complete Model Training Demonstration

This script demonstrates all the different ways to train and use
mental health risk prediction models.

Run this script to see examples of:
- Training with different algorithms
- Making predictions
- Comparing model performance
- Using the model programmatically
"""

from ml_model import MentalHealthMLModel
import json


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")


def example_1_basic_training():
    """Example 1: Basic model training with sample data"""
    print_section("Example 1: Basic Training with Sample Data")
    
    model = MentalHealthMLModel()
    
    # Train with built-in sample data
    print("Training model with built-in sample dataset...")
    results = model.train(model_type='logistic_regression')
    
    print(f"✅ Training completed!")
    print(f"  Model Type: {results['model_type']}")
    print(f"  Accuracy: {results['accuracy']:.2%}")
    print(f"  F1 Score: {results['f1_score']:.4f}")
    print(f"  Training Samples: {results['training_samples']}")
    print(f"  Test Samples: {results['test_samples']}")


def example_2_custom_data():
    """Example 2: Training with custom data"""
    print_section("Example 2: Training with Custom Data")
    
    # Custom training data
    texts = [
        "I'm feeling great and optimistic about the future",
        "Life is going well and I'm happy",
        "I feel content and at peace",
        "Everything is wonderful today",
        "I've been feeling a bit stressed lately",
        "I'm worried about some things",
        "I feel anxious sometimes",
        "I'm struggling with motivation",
        "I feel completely hopeless",
        "I don't see any point anymore",
        "Nothing brings me joy",
        "I feel trapped and desperate"
    ]
    
    labels = [
        'low', 'low', 'low', 'low',
        'moderate', 'moderate', 'moderate', 'moderate',
        'high', 'high', 'high', 'high'
    ]
    
    model = MentalHealthMLModel()
    
    print(f"Training with {len(texts)} custom samples...")
    results = model.train(texts=texts, labels=labels, model_type='random_forest')
    
    print(f"✅ Training completed!")
    print(f"  Accuracy: {results['accuracy']:.2%}")
    print(f"  F1 Score: {results['f1_score']:.4f}")


def example_3_comparing_models():
    """Example 3: Compare different model types"""
    print_section("Example 3: Comparing Model Types")
    
    model_types = ['logistic_regression', 'random_forest', 'gradient_boosting']
    
    print("Training and comparing all three model types...\n")
    
    for model_type in model_types:
        model = MentalHealthMLModel()
        results = model.train(model_type=model_type)
        
        print(f"{model_type.replace('_', ' ').title()}:")
        print(f"  Accuracy: {results['accuracy']:.2%}")
        print(f"  F1 Score: {results['f1_score']:.4f}")
        print(f"  Cross-val Mean: {results['cross_val_mean']:.4f}")
        print()


def example_4_making_predictions():
    """Example 4: Making predictions with trained model"""
    print_section("Example 4: Making Predictions")
    
    # Ensure we have a trained model
    model = MentalHealthMLModel()
    if not model.is_trained:
        print("Training model first...")
        model.train(model_type='logistic_regression')
    
    # Test texts
    test_texts = [
        "I'm feeling really happy and excited about life",
        "I've been feeling anxious and worried lately",
        "I feel completely hopeless and don't want to continue",
        "Work is stressful but I'm managing okay",
        "I'm grateful for my supportive friends and family"
    ]
    
    print("Making predictions on test texts:\n")
    
    for text in test_texts:
        result = model.predict(text)
        
        print(f"Text: \"{text}\"")
        print(f"  Risk Level: {result['risk_level'].upper()}")
        print(f"  Confidence: {result['confidence']:.1%}")
        print(f"  Probabilities:")
        for level, prob in result['probabilities'].items():
            print(f"    {level}: {prob:.1%}")
        print()


def example_5_batch_predictions():
    """Example 5: Batch predictions"""
    print_section("Example 5: Batch Predictions")
    
    model = MentalHealthMLModel()
    if not model.is_trained:
        model.train()
    
    texts = [
        "I'm doing great",
        "I feel anxious",
        "I'm hopeless"
    ]
    
    print("Running batch predictions...\n")
    results = model.predict_batch(texts)
    
    for text, result in zip(texts, results):
        print(f"{text}: {result['risk_level']} ({result['confidence']:.0%} confident)")


def example_6_model_info():
    """Example 6: Getting model information"""
    print_section("Example 6: Model Information")
    
    model = MentalHealthMLModel()
    if not model.is_trained:
        model.train()
    
    info = model.get_model_info()
    
    print("Current Model Status:")
    print(f"  Trained: {info['is_trained']}")
    print(f"  Model Type: {info['model_type']}")
    print(f"  Classes: {', '.join(info['classes'])}")
    print(f"  Feature Count: {info['feature_count']}")
    print(f"  Model Path: {info['model_path']}")


def example_7_csv_loading():
    """Example 7: Loading data from CSV"""
    print_section("Example 7: Loading Data from CSV")
    
    import csv
    import os
    
    csv_path = '../datasets/sample_dataset.csv'
    
    if not os.path.exists(csv_path):
        print(f"⚠️  Sample dataset not found at {csv_path}")
        print("    This example requires the sample dataset file.")
        return
    
    # Load CSV
    texts = []
    labels = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row['text'])
            labels.append(row['label'])
    
    print(f"Loaded {len(texts)} samples from CSV")
    
    # Count labels
    label_counts = {}
    for label in labels:
        label_counts[label] = label_counts.get(label, 0) + 1
    
    print("\nDataset composition:")
    for label, count in sorted(label_counts.items()):
        percentage = (count / len(labels)) * 100
        print(f"  {label}: {count} samples ({percentage:.1f}%)")
    
    # Train with this data
    model = MentalHealthMLModel()
    print("\nTraining model with CSV data...")
    results = model.train(texts=texts, labels=labels, model_type='random_forest')
    
    print(f"✅ Training completed!")
    print(f"  Accuracy: {results['accuracy']:.2%}")


def main():
    """Run all examples"""
    print("\n" + "="*70)
    print("  MENTAL HEALTH ML MODEL - COMPLETE TRAINING EXAMPLES")
    print("="*70)
    
    examples = [
        ("Basic Training", example_1_basic_training),
        ("Custom Data", example_2_custom_data),
        ("Comparing Models", example_3_comparing_models),
        ("Making Predictions", example_4_making_predictions),
        ("Batch Predictions", example_5_batch_predictions),
        ("Model Info", example_6_model_info),
        ("CSV Loading", example_7_csv_loading),
    ]
    
    print("\nAvailable examples:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"  {i}. {name}")
    
    print("\nRunning all examples in sequence...\n")
    input("Press Enter to continue...")
    
    for name, func in examples:
        try:
            func()
            input("\nPress Enter for next example...")
        except Exception as e:
            print(f"\n❌ Error in {name}: {e}")
            import traceback
            traceback.print_exc()
            input("\nPress Enter to continue...")
    
    print_section("All Examples Completed!")
    print("You can now:")
    print("  1. Use the trained model via: from ml_model import get_model")
    print("  2. Train via command line: python train_model.py")
    print("  3. Train via API: POST /api/model/train")
    print("\nFor more information, see docs/MODEL_TRAINING.md")


if __name__ == '__main__':
    main()
