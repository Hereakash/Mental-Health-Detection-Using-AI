# Quick Reference: Model Training

## TL;DR

```bash
cd backend
python train_model.py
```

That's it! This will train a model using built-in sample data.

## Common Commands

### Basic Training
```bash
# Train with sample data
python train_model.py

# Train with your dataset
python train_model.py --data ../datasets/my_data.csv
```

### Choose Algorithm
```bash
# Logistic Regression (default, fast)
python train_model.py --model logistic_regression

# Random Forest (balanced)
python train_model.py --model random_forest

# Gradient Boosting (most accurate)
python train_model.py --model gradient_boosting
```

### Combined Options
```bash
# Custom data + specific model
python train_model.py --data ../datasets/my_data.csv --model random_forest

# Skip testing
python train_model.py --no-test
```

## Model Comparison

| Model | Speed | Accuracy | Best For |
|-------|-------|----------|----------|
| Logistic Regression | ⚡⚡⚡ | Good | Testing, small datasets |
| Random Forest | ⚡⚡ | Better | Production, medium datasets |
| Gradient Boosting | ⚡ | Best | Maximum accuracy, large datasets |

## Dataset Format

Your CSV must have exactly two columns:

```csv
text,label
"Your text here",low
"Another text",moderate
"More text",high
```

**Valid labels:** `low`, `moderate`, `high`

## Minimum Requirements

- ✅ At least 10 samples
- ✅ All three labels present
- ✅ CSV format with headers

## API Training

```bash
# Start server
python app.py

# Train via API
curl -X POST http://localhost:5000/api/model/train

# Make predictions
curl -X POST http://localhost:5000/api/model/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "I feel anxious"}'
```

## Getting Help

```bash
# Show all options
python train_model.py --help

# Read full guide
See: docs/MODEL_TRAINING.md
```

## Troubleshooting

**Error: "Need at least 10 samples"**
→ Add more rows to your CSV file

**Error: "Model not trained"**
→ Run `python train_model.py` first

**Low accuracy (<60%)**
→ Add more training data or try a different model type

## Examples in the Repo

- `datasets/sample_dataset.csv` - 40 ready-to-use examples
- `datasets/template_dataset.csv` - Empty template
- `docs/MODEL_TRAINING.md` - Complete guide

## Quick Test

```bash
cd backend

# 1. Train
python train_model.py

# 2. Test programmatically
python -c "
from ml_model import get_model
model = get_model()
result = model.predict('I feel stressed')
print(f'Risk: {result[\"risk_level\"]}')
"
```

## What Gets Trained?

The model learns to predict mental health risk levels from text:
- **Low risk** - Positive mental state
- **Moderate risk** - Some concerns present
- **High risk** - Significant concerns detected

## Where is the Model Saved?

Trained models are saved to: `models/mental_health_model.joblib`

The model persists between runs - you only need to train once unless you want to update it.

## Next Steps

1. ✅ Train a model (done above)
2. Test predictions via API or Python
3. Integrate with the frontend
4. Collect feedback and retrain with better data

---

**Need more details?** See the [complete training guide](MODEL_TRAINING.md)
