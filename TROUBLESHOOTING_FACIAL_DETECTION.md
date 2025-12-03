# Troubleshooting Facial Detection Issues

This guide helps you resolve common issues with the facial detection feature.

## Common Error: "Failed to Load AI Model" Despite Internet Connection

### Understanding the Issue

Even with a working internet connection, you may see errors about loading AI models. This happens because the facial detection feature requires TWO things to work:

1. **face-api.js library** - Loaded from local file or CDN
2. **AI model files** - Loaded from the `models/` directory via HTTP

### Root Causes and Solutions

#### 1. ⚠️ Face-API.js Library Not Loaded

**Symptoms:**
- Error message mentions "library not loaded"
- Console shows "faceapi is undefined"

**Causes:**
- CDN (cdn.jsdelivr.net) blocked by firewall/network
- Ad-blocker blocking the CDN
- Local library file missing

**Solutions:**
✅ **Disable ad-blockers** for this website
✅ **Check firewall/network settings** - Ensure cdn.jsdelivr.net is accessible
✅ **Verify local file exists**: `assets/js/face-api.min.js` should be present
✅ **Try different browser** - Some browsers have stricter security
✅ **Refresh the page** after disabling ad-blockers

#### 2. ⚠️ AI Models Failed to Load

**Symptoms:**
- Error mentions "models failed to load"
- Console shows 404 errors for model files
- CORS errors in console

**Causes:**
- Opening `index.html` directly (file:// protocol)
- Not using a web server
- Incorrect file permissions
- CORS restrictions

**Solutions:**
✅ **NEVER open index.html directly** - Must use web server
✅ **Use a local web server**:
```bash
# Python (recommended)
python -m http.server 8080
# or Python 3
python3 -m http.server 8080

# Node.js
npx http-server -p 8080

# PHP
php -S localhost:8080
```
✅ **Access via localhost**: http://localhost:8080
✅ **Check models directory** exists and has all files
✅ **Verify file permissions** - Models must be readable

#### 3. ⚠️ Camera Access Issues

**Symptoms:**
- Models load but camera doesn't start
- Permission prompt doesn't appear
- "NotAllowedError" or "NotFoundError"

**Causes:**
- Camera permissions denied
- Another app using camera
- No camera device
- Browser doesn't support getUserMedia

**Solutions:**
✅ **Grant camera permissions** in browser
✅ **Close other apps** using camera (Zoom, Teams, Skype, etc.)
✅ **Check browser settings** - Ensure camera isn't blocked
✅ **Use HTTPS or localhost** - Required for camera access
✅ **Try different browser** - Chrome/Firefox recommended

## Step-by-Step Setup Guide

### For First-Time Users

1. **Download/Clone the Repository**
```bash
git clone <repository-url>
cd Mental-Health-Detection-Using-AI
```

2. **Verify Models Exist**
```bash
ls -la models/
# Should show 9 files including:
# - tiny_face_detector_model-*
# - face_landmark_68_model-*
# - face_recognition_model-*
# - face_expression_model-*
```

3. **Verify face-api.js Library**
```bash
ls -la assets/js/face-api.min.js
# Should show ~649KB file
```

4. **Start Web Server**
```bash
python3 -m http.server 8080
```

5. **Open in Browser**
```
http://localhost:8080
```

6. **Test Facial Detection**
- Click "Start Detection" button
- Allow camera permissions when prompted
- Position your face in view

### For Advanced Users - Offline Setup

If you need to work completely offline or CDN is permanently blocked:

1. **Download face-api.js locally** (if not present):
```bash
cd assets/js
curl -L -o face-api.min.js \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/dist/face-api.min.js"
```

2. **Verify HTML loads local file**:
The HTML now includes fallback mechanism:
```html
<script src="assets/js/face-api.min.js" 
        onerror="/* fallback to CDN */"></script>
```

3. **Test offline**:
- Disconnect from internet
- Start local web server
- Open http://localhost:8080
- Facial detection should work

## Verifying the Setup

### Check 1: Library Loaded
Open browser console (F12) and type:
```javascript
typeof faceapi !== 'undefined'
```
Should return `true`

### Check 2: Models Accessible
Visit: http://localhost:8080/models/
Should show list of model files

### Check 3: Individual Model File
Visit: http://localhost:8080/models/tiny_face_detector_model-weights_manifest.json
Should show JSON content

### Check 4: Camera Available
In browser console:
```javascript
navigator.mediaDevices.getUserMedia({video: true})
  .then(() => console.log('Camera OK'))
  .catch(e => console.error('Camera Error:', e))
```

## Browser Requirements

### Supported Browsers
✅ Chrome/Edge (v60+)
✅ Firefox (v55+)
✅ Safari (v11+)
✅ Opera (v47+)

### Required Browser Features
- getUserMedia API (camera access)
- JavaScript ES6+
- Canvas API
- Fetch API
- Promises

## Common Error Messages Explained

### "LIBRARY_NOT_LOADED"
- **Meaning**: face-api.js didn't load
- **Fix**: Check CDN/local file, disable ad-blockers

### "MODEL_LOAD_FAILED"
- **Meaning**: Can't access models directory
- **Fix**: Use web server, not file://

### "NotAllowedError"
- **Meaning**: Camera permission denied
- **Fix**: Allow camera in browser settings

### "NotFoundError"
- **Meaning**: No camera detected
- **Fix**: Connect webcam, check device manager

### "NotReadableError"
- **Meaning**: Camera in use by another app
- **Fix**: Close other apps using camera

## Still Having Issues?

### Debugging Steps

1. **Open Browser Console** (F12 → Console tab)

2. **Look for Error Messages**:
   - Red text indicates errors
   - Note the exact error message

3. **Check Network Tab** (F12 → Network tab):
   - Look for failed requests (red)
   - Check if models load (200 status)
   - Check if face-api.js loads

4. **Test Step by Step**:
   ```javascript
   // In console:
   console.log('1. Library:', typeof faceapi !== 'undefined');
   
   // Try loading one model:
   faceapi.nets.tinyFaceDetector.loadFromUri('./models')
     .then(() => console.log('2. Models: OK'))
     .catch(e => console.error('2. Models: FAIL', e));
   
   // Test camera:
   navigator.mediaDevices.getUserMedia({video:true})
     .then(() => console.log('3. Camera: OK'))
     .catch(e => console.error('3. Camera: FAIL', e));
   ```

5. **Share Debug Info**:
   If still having issues, include:
   - Browser name and version
   - Operating system
   - Error messages from console
   - Network tab screenshot
   - Whether using web server or file://

## System Requirements

### Minimum Requirements
- Modern browser (see supported browsers)
- Webcam device
- Internet connection (for CDN, first time)
- Web server (Python, Node, PHP, etc.)

### Recommended Setup
- Chrome browser (latest)
- Good lighting for facial detection
- Stable camera position
- Local web server running
- All model files present

## Security Notes

- Camera access requires HTTPS or localhost
- Models processed locally (no data sent to server)
- Face-api.js runs in browser (client-side)
- No facial data is stored or transmitted

## Performance Tips

- Use good lighting for better detection
- Position face clearly in frame
- Close unnecessary browser tabs
- Use a decent webcam (720p+)
- Ensure stable internet for CDN (first load)

## Support

If you encounter issues not covered here:

1. Check browser console for detailed errors
2. Verify all prerequisites are met
3. Try a different browser
4. Restart your computer
5. Open an issue on GitHub with:
   - Detailed description
   - Error messages
   - Browser/OS info
   - Steps to reproduce
