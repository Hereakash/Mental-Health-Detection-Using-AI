# Security Policy

## 🔒 Overview

The Mental Health Detection Using AI project takes security seriously. This document outlines our security practices, how to report vulnerabilities, and what users should know about data security.

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

### How to Report

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public GitHub issue
2. **DO NOT** disclose the vulnerability publicly until it has been addressed
3. Email the maintainers with details (create an issue to request contact info)
4. Provide as much information as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Status Updates**: At least once per week
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2-4 weeks
  - Low: Best effort basis

### Disclosure Policy

- We will coordinate with you on disclosure timing
- Public disclosure will happen after a patch is released
- You will be credited (unless you prefer to remain anonymous)

## Security Best Practices

### For Developers

#### API Key Security

**DO:**
- ✅ Use environment variables for API keys
- ✅ Use `.env` files locally (ensure in `.gitignore`)
- ✅ Rotate API keys regularly
- ✅ Use different keys for development and production
- ✅ Restrict API key permissions when possible

**DON'T:**
- ❌ Commit API keys to version control
- ❌ Share API keys in public channels
- ❌ Use production keys in development
- ❌ Log API keys
- ❌ Embed keys in client-side code

```python
# ✅ GOOD - Use environment variables
import os
API_KEY = os.environ.get("GEMINI_API_KEY")

# ❌ BAD - Hardcoded API key
API_KEY = "AIzaSyB..."  # Never do this!
```

#### Database Security

**DO:**
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Set appropriate file permissions on database
- ✅ Backup database regularly
- ✅ Encrypt sensitive data at rest
- ✅ Limit database access to necessary users

**Example of safe database query:**
```python
# ✅ GOOD - Parameterized query
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))

# ❌ BAD - SQL injection vulnerable
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

#### Input Validation

Always validate and sanitize user input:

```python
# ✅ GOOD - Input validation
def analyze_text(text):
    if not text or not isinstance(text, str):
        return {'error': 'Invalid text input'}
    
    if len(text) > 10000:  # Reasonable limit
        return {'error': 'Text too long'}
    
    # Process text...
```

#### Error Handling

Don't expose sensitive information in error messages:

```python
# ✅ GOOD - Generic error message
try:
    result = process_data()
except Exception as e:
    logger.error(f"Processing error: {e}")
    return {'error': 'An error occurred'}

# ❌ BAD - Exposes internal details
except Exception as e:
    return {'error': str(e)}  # Might leak sensitive info
```

### For Users

#### Protecting Your Data

1. **API Keys**
   - Never share your Gemini API key
   - Regenerate keys if compromised
   - Monitor API usage for anomalies

2. **Personal Information**
   - The app stores data locally in SQLite
   - No data is sent to external servers (except Gemini API for chat)
   - You can delete your data at any time

3. **Browser Security**
   - Use HTTPS when available
   - Keep browser updated
   - Use incognito mode for privacy if needed
   - Clear browser cache/cookies regularly

4. **Database File**
   - `mental_health.db` contains your personal data
   - Keep this file secure
   - Back it up if important
   - Delete it to remove all stored data

### For Administrators

#### Deployment Security

**Production Checklist:**

- [ ] Set `FLASK_DEBUG=false`
- [ ] Set `FLASK_ENV=production`
- [ ] Use HTTPS (Let's Encrypt recommended)
- [ ] Use strong API keys
- [ ] Implement rate limiting
- [ ] Set up firewall rules
- [ ] Enable logging and monitoring
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Access controls configured

**Recommended Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location / {
        limit_req zone=api burst=20;
        proxy_pass http://localhost:5000;
        # Additional proxy settings...
    }
}
```

#### Monitoring

Monitor these security metrics:
- Failed authentication attempts
- Unusual API usage patterns
- Database access patterns
- Error rates
- Response times

## Known Security Considerations

### Current Implementation

1. **No Authentication System**
   - Current version has no user authentication
   - Anyone with access can use the API
   - **Recommendation**: Implement authentication for production

2. **Local Database**
   - SQLite database has no built-in encryption
   - File permissions are the only protection
   - **Recommendation**: Use encrypted database for sensitive deployments

3. **API Key in Memory**
   - Gemini API key is loaded into memory
   - Could be exposed if server is compromised
   - **Mitigation**: Use environment variables, not hardcoded values

4. **CORS Enabled**
   - CORS is enabled for all origins
   - **Recommendation**: Restrict to specific origins in production

5. **No Rate Limiting**
   - API has no built-in rate limiting
   - Vulnerable to abuse
   - **Recommendation**: Implement rate limiting with Flask-Limiter

### Gemini API Considerations

1. **Data Sent to Google**
   - Chat messages are sent to Google's Gemini API
   - Subject to Google's privacy policy
   - **Mitigation**: Use fallback mode for sensitive data

2. **API Quota**
   - API has usage limits
   - Exceeding limits will cause service disruption
   - **Mitigation**: Monitor usage, implement caching

## Data Privacy

### What Data is Stored

**Locally (SQLite Database):**
- User profiles (name, email, age)
- Chat messages and history
- Assessment results
- Detected emotions and topics

**External Services:**
- Google Gemini API: Chat messages (when using AI chatbot)
- No other external data transmission

### Data Retention

- Data is stored indefinitely in local database
- Users can delete their data via the API
- Clear chat history: `DELETE /api/chat/history/{user_id}`
- No automatic data deletion implemented

### GDPR Compliance

For European users, current implementation provides:
- ✅ Right to access: Users can export their data via API
- ✅ Right to deletion: Users can delete their data via API
- ✅ Right to portability: Data is in standard SQLite format

**Additional implementations needed for full GDPR compliance:**

1. **Consent Management**
   - Explicit consent collection before data processing
   - Granular consent options (analytics, chatbot, etc.)
   - Consent withdrawal mechanism
   - Audit trail of consent changes

2. **Data Processing Agreements (DPA)**
   - Document data processing activities
   - Define data processor/controller roles
   - Third-party processor agreements (Google Gemini API)
   - Data transfer impact assessments

3. **Automated Deletion**
   - Scheduled data retention policies
   - Automatic deletion after retention period
   - Data anonymization options
   - Backup data purging procedures

4. **Privacy by Design**
   - Data minimization practices
   - Privacy impact assessments
   - Documentation of technical measures
   - Regular compliance audits

5. **User Rights Portal**
   - Self-service data export (JSON/CSV)
   - One-click data deletion
   - Access request management
   - Data rectification interface

6. **Documentation Requirements**
   - Privacy policy (required)
   - Cookie policy (if applicable)
   - Data processing register
   - Breach notification procedures

**Recommendation**: Consult with a privacy lawyer before processing EU citizen data in production.

## Third-Party Dependencies

### Critical Dependencies

Monitor security advisories for:
- Flask
- google-generativeai
- scikit-learn
- SQLite3

### Keeping Dependencies Updated

```bash
# Check for outdated packages
pip list --outdated

# Update packages
pip install --upgrade -r requirements.txt

# Security audit (if using pip-audit)
pip install pip-audit
pip-audit
```

## Security Checklist

### Before Deploying

- [ ] All API keys in environment variables
- [ ] Debug mode disabled
- [ ] HTTPS configured
- [ ] Database file permissions set correctly
- [ ] Error messages don't expose sensitive info
- [ ] Rate limiting configured
- [ ] Logging and monitoring set up
- [ ] Security headers configured
- [ ] Dependencies up to date
- [ ] Firewall rules in place

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Review access logs weekly
- [ ] Backup database regularly
- [ ] Rotate API keys quarterly
- [ ] Review and update security policies
- [ ] Test disaster recovery procedures

## Incident Response

### If Security Breach Occurs

1. **Immediate Actions**
   - Disconnect affected systems
   - Assess scope of breach
   - Preserve logs and evidence

2. **Notification**
   - Notify affected users
   - Report to relevant authorities (if required)
   - Document the incident

3. **Recovery**
   - Fix vulnerability
   - Restore from clean backup
   - Reset compromised credentials

4. **Post-Incident**
   - Conduct post-mortem
   - Update security measures
   - Document lessons learned

## Contact

For security concerns:
- Create a GitHub issue (for non-sensitive matters)
- Email maintainers (for sensitive vulnerability reports)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Flask Security](https://flask.palletsprojects.com/en/2.3.x/security/)
- [Google Cloud Security](https://cloud.google.com/security)
- [Python Security Best Practices](https://python.readthedocs.io/en/stable/library/security_warnings.html)

---

**Remember: Security is everyone's responsibility. Report vulnerabilities responsibly and help keep this project safe for all users.**

---

Last Updated: December 2024
