# 🤝 Contributing to Mental Health Detection Using AI

Thank you for your interest in contributing to this project! We welcome contributions from developers, mental health professionals, UX designers, and anyone passionate about mental health and AI.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion, or sexual identity and orientation

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members
- Be especially mindful when discussing sensitive mental health topics

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Making light of mental health conditions or crises
- Any conduct that could reasonably be considered inappropriate

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting bugs, include:**
- Clear, descriptive title
- Exact steps to reproduce
- Expected vs. actual behavior
- Screenshots/screen recordings (if applicable)
- Environment details:
  - OS and version
  - Python version
  - Browser and version
  - Package versions

**Use this template:**
```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What you expected to happen

**Actual Behavior:**
What actually happened

**Screenshots:**
If applicable, add screenshots

**Environment:**
- OS: [e.g., Ubuntu 22.04]
- Python: [e.g., 3.10.5]
- Browser: [e.g., Chrome 120]

**Additional Context:**
Any other relevant information
```

### 💡 Suggesting Enhancements

Enhancement suggestions are welcome! Please include:
- Clear, descriptive title
- Detailed description of the proposed feature
- Why this enhancement would be useful
- Examples of how it would work
- Mockups or diagrams (if applicable)

**Use this template:**
```markdown
**Feature Description:**
Clear description of the feature

**Problem It Solves:**
What problem does this address?

**Proposed Solution:**
How would it work?

**Alternatives Considered:**
Other approaches you've thought about

**Additional Context:**
Mockups, examples, or references
```

### 📝 Improving Documentation

Documentation improvements are always appreciated:
- Fix typos or unclear explanations
- Add examples or tutorials
- Translate documentation
- Improve API documentation
- Add diagrams or visualizations

### 🎨 Design Contributions

Help improve the user experience:
- UI/UX improvements
- Accessibility enhancements
- Mobile responsiveness
- Visual design refinements
- Icon and asset creation

### 🔬 Research Contributions

Contributions from mental health professionals:
- Validate assessment scales
- Review recommendation content
- Suggest evidence-based interventions
- Provide clinical expertise
- Review ethical considerations

---

## Getting Started

### Prerequisites

- Python 3.8+
- Git
- Text editor or IDE
- Google Gemini API key (for chatbot development)

### Fork and Clone

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Mental-Health-Detection-Using-AI.git
   cd Mental-Health-Detection-Using-AI
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/Hereakash/Mental-Health-Detection-Using-AI.git
   ```

### Set Up Development Environment

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # If exists
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Initialize database:**
   ```bash
   python -c "from database import init_database; init_database()"
   ```

5. **Verify setup:**
   ```bash
   python app.py
   # Open http://localhost:5000/api/health
   ```

---

## Development Workflow

### Create a Branch

Always create a new branch for your work:

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `style/` - Code style changes

### Make Changes

1. **Write code** following our [coding standards](#coding-standards)
2. **Test thoroughly** - ensure nothing breaks
3. **Document** - update relevant documentation
4. **Commit regularly** with clear messages

### Stay Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git rebase upstream/main
```

---

## Coding Standards

### Python Style Guide

Follow **PEP 8** style guide:

```python
# Good
def calculate_risk_level(scores, indicators):
    """Calculate overall risk level from scores and indicators.
    
    Args:
        scores (dict): Questionnaire scores
        indicators (dict): Detected mental health indicators
        
    Returns:
        str: Risk level ('low', 'moderate', 'high')
    """
    if not scores:
        return 'low'
    
    # Implementation
    return risk_level
```

**Key points:**
- Use 4 spaces for indentation (no tabs)
- Maximum line length: 88 characters (Black formatter standard)
- Use descriptive variable names
- Add docstrings to functions and classes
- Type hints encouraged for function parameters

### JavaScript Style Guide

Follow **ES6+ standards:**

```javascript
// Good
const analyzeEmotion = async (emotionData) => {
  if (!emotionData) {
    throw new Error('Emotion data is required');
  }
  
  const result = await processEmotions(emotionData);
  return result;
};
```

**Key points:**
- Use `const` and `let` (never `var`)
- Use arrow functions for callbacks
- Use async/await over promises
- Use template literals for strings
- Add JSDoc comments for functions

### HTML/CSS Standards

```html
<!-- Good HTML -->
<section class="assessment-section" id="questionnaire-section">
  <h2 class="section-title">Mental Health Assessment</h2>
  <form class="assessment-form">
    <!-- Form content -->
  </form>
</section>
```

```css
/* Good CSS */
.assessment-section {
  padding: 2rem;
  background-color: var(--background-light);
  border-radius: 8px;
}

.section-title {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}
```

**Key points:**
- Use semantic HTML elements
- Use BEM or consistent naming convention
- Mobile-first responsive design
- Ensure accessibility (ARIA labels, alt text)

### Code Formatting

We recommend using automated formatters:

**Python:**
```bash
pip install black isort flake8
black backend/
isort backend/
flake8 backend/
```

**JavaScript:**
```bash
npm install -g prettier eslint
prettier --write "*.js"
eslint --fix "*.js"
```

---

## Testing Guidelines

### Write Tests

Add tests for new features and bug fixes:

**Python tests:**
```python
# test_chatbot.py
import pytest
from chatbot import MentalHealthChatbot

def test_chatbot_initialization():
    bot = MentalHealthChatbot()
    assert bot is not None
    assert hasattr(bot, 'get_response')

def test_crisis_detection():
    bot = MentalHealthChatbot()
    result = bot.get_response("I want to hurt myself", [], None)
    assert result['risk_level'] == 'high'
    assert 'crisis' in result['response'].lower()
```

**Run tests:**
```bash
pytest backend/tests/
```

### Manual Testing Checklist

Before submitting a PR, test:
- [ ] Backend API endpoints work correctly
- [ ] Chatbot responses are appropriate
- [ ] Frontend UI displays correctly
- [ ] Database operations succeed
- [ ] Error handling works
- [ ] Edge cases are handled
- [ ] Mobile responsiveness works

---

## Documentation

### Update Documentation

When making changes, update relevant documentation:

1. **README.md** - For major features or changes
2. **API_DOCUMENTATION.md** - For API changes
3. **Docstrings** - For code changes
4. **Comments** - For complex logic
5. **CHANGELOG.md** - Document notable changes

### Documentation Style

- Use clear, simple language
- Provide examples
- Include code snippets
- Add screenshots for UI changes
- Keep formatting consistent

---

## Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat(chatbot): add crisis detection for self-harm keywords"
git commit -m "fix(api): resolve CORS error in chat endpoint"
git commit -m "docs(readme): add Gemini API configuration section"
git commit -m "style(frontend): improve button hover states"
```

### Good Commit Practices

- Make atomic commits (one logical change per commit)
- Write clear, descriptive messages
- Reference issues when applicable: `Fixes #123`
- Keep commits focused and small

---

## Pull Request Process

### Before Submitting

1. **Update your branch:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linters:**
   ```bash
   pytest backend/tests/
   black backend/
   flake8 backend/
   ```

3. **Update documentation**

4. **Test thoroughly**

### Create Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub**

3. **Fill out PR template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Refactoring
   
   ## Changes Made
   - Change 1
   - Change 2
   
   ## Testing Done
   - [ ] Tested locally
   - [ ] All tests pass
   - [ ] Tested on multiple browsers
   
   ## Screenshots
   If applicable
   
   ## Related Issues
   Closes #123
   ```

4. **Link related issues:**
   - Use `Closes #123` to auto-close issues
   - Reference with `Related to #456`

### PR Review Process

- Maintainers will review within 3-5 days
- Address feedback promptly
- Make requested changes
- Keep discussion professional and constructive

### After PR Approval

- Squash commits if requested
- Maintainer will merge
- Delete your branch after merge

---

## Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and community discussions
- **Pull Requests** - Code review and contributions

### Getting Help

- Check [documentation](README.md)
- Search [existing issues](https://github.com/Hereakash/Mental-Health-Detection-Using-AI/issues)
- Ask in GitHub Discussions
- Be patient and respectful

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Recognized in project documentation

---

## Development Resources

### Useful Links

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [face-api.js Documentation](https://github.com/justadudewhohacks/face-api.js)
- [Mental Health Resources](https://www.nimh.nih.gov/)

### Mental Health Assessment Scales

- [PHQ-9 Information](https://www.apa.org/depression-guideline/patient-health-questionnaire.pdf)
- [GAD-7 Information](https://www.integration.samhsa.gov/clinical-practice/gad708.19.08cartwright.pdf)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## Questions?

If you have questions about contributing:
1. Check this guide
2. Search existing issues and discussions
3. Open a new discussion
4. Be specific and provide context

---

**Thank you for contributing to mental health awareness and AI-powered support! Your contributions make a difference. 💙**

---

## Quick Contribution Checklist

- [ ] Fork the repository
- [ ] Create a feature branch
- [ ] Make your changes
- [ ] Write/update tests
- [ ] Update documentation
- [ ] Follow coding standards
- [ ] Write clear commit messages
- [ ] Push to your fork
- [ ] Open a Pull Request
- [ ] Respond to feedback

**Happy Contributing! 🚀**
