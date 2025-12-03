# Model Training Guide

This guide explains how to train machine learning models for mental health risk prediction in the Mental Health Detection System.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Training Methods](#training-methods)
- [Model Types](#model-types)
- [Dataset Preparation](#dataset-preparation)
- [Training with Custom Data](#training-with-custom-data)
- [API-Based Training](#api-based-training)
- [Model Evaluation](#model-evaluation)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The system supports training machine learning models to predict mental health risk levels (low, moderate, high) from text input. You can train models using:

1. **Built-in sample dataset** - Quick start for testing
2. **Custom CSV datasets** - Your own labeled data
3. **API endpoints** - Programmatic training via REST API

## Prerequisites

### Software Requirements
- Python 3.7 or higher
- pip (Python package manager)

### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

## Quick Start

Train a model using the built-in sample dataset:

```bash
cd backend
python train_model.py
```

This will:
- Train a Logistic Regression model
- Use built-in sample data (50 samples)
- Save the trained model to `models/mental_health_model.joblib`
- Display training metrics and test predictions

## Training Methods

### Method 1: Command-Line Script (Recommended for Beginners)

The `train_model.py` script provides an easy-to-use interface:

```bash
# Basic training with sample data
python train_model.py

# Train with custom dataset
python train_model.py --data ../datasets/my_dataset.csv

# Choose model algorithm
python train_model.py --model random_forest

# Combine options
python train_model.py --data ../datasets/my_dataset.csv --model gradient_boosting
```

**Available Options:**
- `--data, -d` : Path to CSV dataset file
- `--model, -m` : Model type (logistic_regression, random_forest, gradient_boosting)
- `--test-size` : Proportion of data for testing (default: 0.2)
- `--no-test` : Skip testing after training
- `--test-texts` : Custom texts to test the model with

### Method 2: Python Script

Create a custom training script:

```python
from ml_model import MentalHealthMLModel

# Initialize model
model = MentalHealthMLModel()

# Option 1: Train with sample data
results = model.train(model_type='logistic_regression')

# Option 2: Train with custom data
texts = [
    "I feel great today",
    "I'm worried about things",
    "I feel hopeless"
]
labels = ['low', 'moderate', 'high']

results = model.train(texts=texts, labels=labels, model_type='random_forest')

# View results
print(f"Accuracy: {results['accuracy']}")
print(f"F1 Score: {results['f1_score']}")
```

### Method 3: REST API

Train via HTTP requests:

```bash
# Train with sample data (default: Logistic Regression)
curl -X POST http://localhost:5000/api/model/train

# Train with specific model type
curl -X POST http://localhost:5000/api/model/train \
  -H "Content-Type: application/json" \
  -d '{"model_type": "random_forest"}'

# Train with custom data
curl -X POST http://localhost:5000/api/model/train \
  -H "Content-Type: application/json" \
  -d '{
    "model_type": "logistic_regression",
    "texts": ["I feel great", "I feel anxious", "I feel hopeless"],
    "labels": ["low", "moderate", "high"]
  }'
```

## Model Types

The system supports three machine learning algorithms:

### 1. Logistic Regression (Default)
**Best for:** General use, interpretability, fast training

**Characteristics:**
- Fast training and prediction
- Easily interpretable coefficients
- Good baseline performance
- Works well with limited data

**When to use:**
- Starting out or testing
- Limited training data (<500 samples)
- Need quick training times
- Want to understand feature importance

```bash
python train_model.py --model logistic_regression
```

### 2. Random Forest
**Best for:** Robust predictions, handling noisy data

**Characteristics:**
- Ensemble of decision trees
- Resistant to overfitting
- Handles non-linear patterns
- Provides feature importance

**When to use:**
- Medium-sized datasets (500-5000 samples)
- Data with complex patterns
- Want robust predictions
- Can afford longer training time

```bash
python train_model.py --model random_forest
```

### 3. Gradient Boosting
**Best for:** Maximum accuracy, large datasets

**Characteristics:**
- Iteratively improves predictions
- Often highest accuracy
- Slower training
- Can overfit on small datasets

**When to use:**
- Large datasets (>1000 samples)
- Maximum accuracy is priority
- Have computational resources
- Production deployment with quality data

```bash
python train_model.py --model gradient_boosting
```

## Dataset Preparation

### Required Format

Datasets must be CSV files with two columns:

| Column | Description | Required Values |
|--------|-------------|----------------|
| `text` | User's text describing mental state | Any text string |
| `label` | Risk level classification | `low`, `moderate`, or `high` |

### Example CSV:
```csv
text,label
"I feel happy and optimistic",low
"I've been feeling anxious",moderate
"I feel hopeless and trapped",high
```

### Dataset Guidelines

**Minimum Requirements:**
- At least 10 samples total
- Representation of all three labels (low, moderate, high)
- Clean, relevant text data

**Recommended Size:**
- **Minimum:** 50-100 samples for basic functionality
- **Good:** 500-1000 samples for reliable predictions
- **Optimal:** 2000+ samples for production use

**Class Balance:**
Try to maintain reasonable balance between classes:
- **Balanced:** 30-40% each class (ideal)
- **Acceptable:** 20-50% for each class
- **Problematic:** <10% or >80% for any class

### Sample Datasets

We provide sample datasets in the `datasets/` directory:

1. **`sample_dataset.csv`** - 40 examples for testing
2. **`template_dataset.csv`** - Empty template to fill in

### Creating Your Dataset

1. **Copy the template:**
   ```bash
   cp datasets/template_dataset.csv datasets/my_dataset.csv
   ```

2. **Add your data:**
   - Open `my_dataset.csv` in Excel, Google Sheets, or text editor
   - Add text samples and corresponding labels
   - Save the file

3. **Validate your dataset:**
   ```bash
   python train_model.py --data datasets/my_dataset.csv --no-test
   ```

### Data Quality Tips

**DO:**
✅ Include diverse examples representing real user input
✅ Use clear, unambiguous labels
✅ Include varying text lengths (short and long)
✅ Represent different mental health indicators
✅ Remove personal identifying information (PII)

**DON'T:**
❌ Use duplicate or near-duplicate samples
❌ Include empty or very short texts (<5 words)
❌ Use inconsistent labeling criteria
❌ Include real user data without consent
❌ Copy copyrighted mental health assessments

## Training with Custom Data

### Step-by-Step Process

1. **Prepare Your Dataset**
   ```bash
   # Create your CSV file in the datasets directory
   nano datasets/my_training_data.csv
   ```

2. **Validate Data Format**
   ```python
   import csv
   
   with open('datasets/my_training_data.csv', 'r') as f:
       reader = csv.DictReader(f)
       for i, row in enumerate(reader):
           print(f"Sample {i+1}: {row['text'][:50]}... -> {row['label']}")
           if i >= 5:
               break
   ```

3. **Train the Model**
   ```bash
   python train_model.py --data datasets/my_training_data.csv
   ```

4. **Review Training Results**
   - Check accuracy metrics
   - Verify per-class performance
   - Test with example predictions

5. **Test the Model**
   ```python
   from ml_model import get_model
   
   model = get_model()
   result = model.predict("Your test text here")
   print(f"Prediction: {result['risk_level']}")
   print(f"Confidence: {result['confidence']}")
   ```

### Advanced Training Options

**Custom Train/Test Split:**
```bash
python train_model.py --data my_data.csv --test-size 0.3
```

**Test with Specific Examples:**
```bash
python train_model.py --test-texts "I feel great" "I'm worried" "I'm hopeless"
```

## API-Based Training

### Starting the API Server

```bash
cd backend
python app.py
```

The API will be available at `http://localhost:5000`

### Training Endpoints

**Train Model:**
```http
POST /api/model/train
Content-Type: application/json

{
  "model_type": "logistic_regression",
  "texts": ["text1", "text2", ...],
  "labels": ["low", "moderate", ...]
}
```

**Get Model Info:**
```http
GET /api/model/info
```

**Make Prediction:**
```http
POST /api/model/predict
Content-Type: application/json

{
  "text": "I've been feeling anxious lately"
}
```

### Python API Client Example

```python
import requests

# Train model
response = requests.post('http://localhost:5000/api/model/train', json={
    'model_type': 'random_forest',
    'texts': ['I feel happy', 'I feel sad', 'I feel hopeless'],
    'labels': ['low', 'moderate', 'high']
})
print(response.json())

# Make prediction
response = requests.post('http://localhost:5000/api/model/predict', json={
    'text': 'I have been feeling stressed'
})
print(response.json())
```

### JavaScript/Node.js Example

```javascript
// Train model
const trainResponse = await fetch('http://localhost:5000/api/model/train', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model_type: 'logistic_regression'
  })
});
const trainData = await trainResponse.json();
console.log(trainData);

// Get predictions
const predictResponse = await fetch('http://localhost:5000/api/model/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'I feel anxious about the future'
  })
});
const prediction = await predictResponse.json();
console.log(prediction);
```

## Model Evaluation

### Understanding Metrics

**Accuracy:**
- Percentage of correct predictions
- Target: >70% for basic use, >85% for production

**F1 Score:**
- Balance between precision and recall
- Range: 0.0 to 1.0
- Target: >0.70 for reliable predictions

**Cross-Validation:**
- Tests model on different data splits
- Mean score should be close to test accuracy
- Low std deviation indicates stability

**Per-Class Metrics:**

- **Precision:** Of predicted class X, how many were actually X?
- **Recall:** Of actual class X, how many were correctly identified?
- **F1-Score:** Harmonic mean of precision and recall
- **Support:** Number of actual samples in test set

### Interpreting Results

**Good Model:**
```
Accuracy: 85-95%
F1 Score: 0.80-0.95
Cross-val Mean: Similar to accuracy
Cross-val Std: <0.10
All classes: Precision & Recall >70%
```

**Needs Improvement:**
```
Accuracy: <70%
F1 Score: <0.60
Cross-val Std: >0.15
Some classes: Precision or Recall <50%
```

### Improving Model Performance

1. **Increase Training Data:**
   - More samples generally = better performance
   - Target: 500+ samples minimum

2. **Balance Classes:**
   - Add more samples for underrepresented classes
   - Use data augmentation techniques

3. **Try Different Models:**
   - Start with Logistic Regression
   - Move to Random Forest if needed
   - Use Gradient Boosting for maximum accuracy

4. **Improve Data Quality:**
   - Remove ambiguous or mislabeled samples
   - Add more diverse examples
   - Ensure consistent labeling criteria

5. **Feature Engineering:**
   - The model uses TF-IDF features automatically
   - Consider adding more training data with varied vocabulary

## Best Practices

### Data Collection
- ✅ Obtain proper consent for any real user data
- ✅ Remove all personally identifiable information (PII)
- ✅ Use diverse, representative samples
- ✅ Follow ethical guidelines for mental health data

### Model Selection
- 🚀 Start with Logistic Regression for baseline
- 📊 Use Random Forest for production with medium data
- 🎯 Use Gradient Boosting when accuracy is critical

### Training Workflow
1. Start with sample data to verify setup
2. Create small custom dataset (50-100 samples)
3. Train and evaluate initial model
4. Iterate: add more data based on weak areas
5. Re-train and compare metrics
6. Deploy when metrics are satisfactory

### Model Updates
- 🔄 Retrain periodically with new data
- 📈 Monitor prediction performance in production
- 🎯 Collect feedback to improve training data
- ⚠️ Version control your datasets and models

### Security & Privacy
- 🔒 Never commit real user data to version control
- 🗑️ Delete training data after model is trained
- 🔐 Secure API endpoints in production
- ⚖️ Comply with data protection regulations (GDPR, HIPAA)

## Troubleshooting

### Common Issues

**Issue: "Model not trained" error**
```
Solution: Train the model first:
python train_model.py
```

**Issue: Low accuracy (<60%)**
```
Solutions:
1. Check data quality and labels
2. Increase training data size
3. Balance class distribution
4. Try different model type
```

**Issue: "Need at least 10 samples" error**
```
Solution: Add more samples to your dataset.
Minimum: 10 samples
Recommended: 50+ samples
```

**Issue: Some classes perform poorly**
```
Solutions:
1. Add more samples for weak classes
2. Review labeling criteria
3. Check for ambiguous examples
```

**Issue: Model overfitting (training accuracy >> test accuracy)**
```
Solutions:
1. Add more training data
2. Use simpler model (Logistic Regression)
3. Increase test_size parameter
```

**Issue: Import errors**
```
Solution: Install dependencies:
cd backend
pip install -r requirements.txt
```

### Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review this documentation
3. Verify your dataset format
4. Try training with sample data
5. Check the GitHub issues page

## Examples

### Example 1: Quick Start Training

```bash
# Navigate to backend directory
cd backend

# Train with sample data
python train_model.py

# Output will show training results and test predictions
```

### Example 2: Custom Dataset Training

```bash
# Create your dataset
cat > datasets/my_data.csv << EOF
text,label
"I'm feeling great today",low
"I'm worried about work",moderate
"I feel completely hopeless",high
EOF

# Train with your data
python train_model.py --data datasets/my_data.csv --model random_forest
```

### Example 3: API Training

```python
import requests

# Start the API server first: python app.py

# Train model via API
url = 'http://localhost:5000/api/model/train'
data = {
    'model_type': 'logistic_regression',
    'texts': [
        'I feel happy and content',
        'I am worried and anxious',  
        'I feel hopeless and desperate'
    ],
    'labels': ['low', 'moderate', 'high']
}

response = requests.post(url, json=data)
print(response.json())

# Make predictions
pred_url = 'http://localhost:5000/api/model/predict'
pred_data = {'text': 'I feel stressed about everything'}
pred_response = requests.post(pred_url, json=pred_data)
print(pred_response.json())
```

### Example 4: Programmatic Training

```python
from ml_model import MentalHealthMLModel
import csv

# Load custom dataset
def load_my_data(filepath):
    texts, labels = [], []
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row['text'])
            labels.append(row['label'])
    return texts, labels

# Initialize and train
model = MentalHealthMLModel()
texts, labels = load_my_data('datasets/my_data.csv')

# Train with different models and compare
for model_type in ['logistic_regression', 'random_forest', 'gradient_boosting']:
    print(f"\n{'='*60}")
    print(f"Training {model_type}...")
    print('='*60)
    
    results = model.train(texts, labels, model_type=model_type)
    
    print(f"Accuracy: {results['accuracy']:.2%}")
    print(f"F1 Score: {results['f1_score']:.4f}")
    
# Test predictions
test_texts = [
    "I'm feeling really good about life",
    "I'm anxious about my job",
    "I can't cope anymore"
]

for text in test_texts:
    result = model.predict(text)
    print(f"\nText: {text}")
    print(f"Predicted: {result['risk_level']} ({result['confidence']:.1%} confident)")
```

## Next Steps

After training your model:

1. **Test thoroughly** with diverse examples
2. **Integrate** with the frontend application
3. **Monitor** predictions in real usage
4. **Collect feedback** for model improvements
5. **Retrain periodically** with new data

Remember: This is an educational tool. Always recommend professional mental health support for serious concerns.

---

For more information, see:
- [Main README](../README.md)
- [API Documentation](../backend/app.py)
- [ML Model Source](../backend/ml_model.py)
