# How to Train Your Model - Simple Guide

This is the simplest possible guide to train a mental health risk prediction model.

## Option 1: Train with Sample Data (Easiest - 1 Command)

```bash
cd backend
python train_model.py
```

**That's it!** Your model is now trained and saved.

## Option 2: Train with Your Own Data (3 Steps)

### Step 1: Create Your Dataset

Create a CSV file with two columns: `text` and `label`

```csv
text,label
"I'm feeling great today",low
"I'm worried about work",moderate
"I feel hopeless",high
```

Save it as `my_dataset.csv` in the `datasets/` folder.

### Step 2: Train

```bash
cd backend
python train_model.py --data ../datasets/my_dataset.csv
```

### Step 3: Done!

Your model is trained and automatically saved.

## Which Model Should I Use?

### Beginner? Start Here:
```bash
python train_model.py --model logistic_regression
```
- **Fast training**
- **Good for testing**
- **Works with small datasets**

### For Better Results:
```bash
python train_model.py --model random_forest
```
- **More accurate**
- **Good for production**
- **Handles complex patterns**

### For Maximum Accuracy:
```bash
python train_model.py --model gradient_boosting
```
- **Best accuracy**
- **Slower training**
- **Needs more data (1000+ samples)**

## Quick Model Comparison

| Model | Speed | Accuracy | When to Use |
|-------|-------|----------|-------------|
| Logistic Regression | ⚡⚡⚡ | Good | Testing, small data |
| Random Forest | ⚡⚡ | Better | Production, medium data |
| Gradient Boosting | ⚡ | Best | Max accuracy, large data |

## What Does the Model Predict?

The model predicts mental health risk levels:
- **Low** - Positive mental state
- **Moderate** - Some concerns
- **High** - Significant concerns

## Testing Your Model

After training, test it:

```python
from ml_model import get_model

model = get_model()
result = model.predict("I feel anxious about things")

print(f"Risk: {result['risk_level']}")
print(f"Confidence: {result['confidence']:.0%}")
```

## Common Issues

**"Need at least 10 samples"**
→ Your dataset is too small. Add more rows.

**"Model not trained"**
→ Run `python train_model.py` first.

**Low accuracy (<60%)**
→ Add more training data (aim for 500+ samples).

## Need More Help?

- **Quick Reference**: `docs/QUICK_START.md`
- **Complete Guide**: `docs/MODEL_TRAINING.md`
- **Examples**: Run `python backend/examples_training.py`

## Training via API

Start the server:
```bash
cd backend
python app.py
```

Train via HTTP:
```bash
curl -X POST http://localhost:5000/api/model/train
```

## Summary

**Simplest way to train:**
```bash
cd backend && python train_model.py
```

**With your data:**
```bash
cd backend && python train_model.py --data ../datasets/my_data.csv
```

**Best model for most cases:**
```bash
cd backend && python train_model.py --model random_forest
```

That's all you need to know to get started! 🎉

For advanced features and detailed explanations, see the full documentation in `docs/MODEL_TRAINING.md`.
