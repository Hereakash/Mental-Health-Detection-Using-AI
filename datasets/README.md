# Training Datasets

This directory contains sample datasets for training mental health risk prediction models.

## Files

### `sample_dataset.csv`
A complete sample dataset with 40 examples for testing the training pipeline:
- 10 low-risk examples
- 15 moderate-risk examples  
- 15 high-risk examples

Use this to verify your training setup works correctly:
```bash
cd backend
python train_model.py --data ../datasets/sample_dataset.csv
```

### `template_dataset.csv`
An empty template you can use to create your own training dataset.

**To use:**
1. Copy the template: `cp template_dataset.csv my_dataset.csv`
2. Add your text samples and labels
3. Train: `cd backend && python train_model.py --data ../datasets/my_dataset.csv`

## Dataset Format

All datasets must be CSV files with these columns:

| Column | Description | Valid Values |
|--------|-------------|--------------|
| `text` | User's text input | Any text string |
| `label` | Risk level | `low`, `moderate`, or `high` |

### Example:
```csv
text,label
"I'm feeling great and optimistic",low
"I've been worried about things",moderate
"I feel hopeless and trapped",high
```

## Guidelines

### Minimum Requirements
- At least 10 total samples
- All three labels represented (low, moderate, high)
- Clean, relevant text data

### Recommended Size
- **Minimum:** 50-100 samples
- **Good:** 500-1000 samples
- **Production:** 2000+ samples

### Class Balance
Aim for balanced representation:
- **Ideal:** 30-40% per class
- **Acceptable:** 20-50% per class
- **Avoid:** <10% or >80% for any single class

### Data Quality

**DO:**
- ✅ Use diverse, realistic examples
- ✅ Include various text lengths
- ✅ Remove personal identifying information (PII)
- ✅ Use clear, consistent labeling

**DON'T:**
- ❌ Include duplicate samples
- ❌ Use very short texts (<5 words)
- ❌ Mix labeling criteria
- ❌ Include real user data without consent

## Privacy & Ethics

⚠️ **Important:**
- Never commit real user data without explicit consent
- Always remove PII (names, emails, etc.)
- Follow ethical guidelines for mental health data
- Comply with data protection regulations (GDPR, HIPAA)

## Creating Your Own Dataset

1. **Copy the template:**
   ```bash
   cp template_dataset.csv my_custom_dataset.csv
   ```

2. **Edit the file:**
   - Use a text editor, Excel, or Google Sheets
   - Add rows with text and corresponding labels
   - Save as CSV format

3. **Validate:**
   ```bash
   cd backend
   python train_model.py --data ../datasets/my_custom_dataset.csv --no-test
   ```

4. **Train:**
   ```bash
   python train_model.py --data ../datasets/my_custom_dataset.csv
   ```

## Example Datasets from Research

For production use, consider these publicly available mental health datasets:

- **DAIC-WOZ Depression Database** - Clinical interviews
- **CLPsych Shared Tasks** - Mental health from social media
- **eRisk Workshop Data** - Early risk detection datasets
- **Reddit Mental Health Dataset** - Community discussions

**Note:** Always check licensing and ethical guidelines before using research datasets.

## Need Help?

See the comprehensive [Model Training Guide](../docs/MODEL_TRAINING.md) for:
- Detailed training instructions
- Model selection guidance
- Performance optimization tips
- Troubleshooting common issues

---

**Remember:** This tool is for educational purposes. Always recommend professional mental health support for serious concerns.
