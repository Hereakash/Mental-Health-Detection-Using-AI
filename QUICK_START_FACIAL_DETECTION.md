# Quick Start Guide - Facial Detection

This guide will help you get the facial detection feature working in under 5 minutes.

## Prerequisites

- ✅ Python 3.x installed (check: `python --version` or `python3 --version`)
- ✅ A webcam/camera device
- ✅ Modern browser (Chrome, Firefox, Edge, Safari)

## Step-by-Step Setup

### 1. Verify Setup (Optional but Recommended)

Run the verification script to check if everything is in place:

```bash
bash verify-setup.sh
```

If you see "✓ All checks passed!", skip to Step 3.

### 2. Fix Any Issues

If the verification script reports errors:

**Missing face-api.js library:**
```bash
mkdir -p assets/js
cd assets/js
curl -L -o face-api.min.js \
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/dist/face-api.min.js"
cd ../..
```

**Missing models:**
The models should be in the repository. If missing, you need to download them from the face-api.js repository.

### 3. Start the Web Server

**Important:** You MUST use a web server. Opening `index.html` directly will NOT work.

```bash
# Start server (choose one):

# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js
npx http-server -p 8080
```

You should see output like:
```
Serving HTTP on 0.0.0.0 port 8080 (http://0.0.0.0:8080/) ...
```

### 4. Open in Browser

Open your browser and go to:
```
http://localhost:8080
```

**Do NOT use:** `file:///path/to/index.html`

### 5. Test Facial Detection

1. Click the **"Start Detection"** button on the home page
2. Allow camera permissions when prompted
3. Position your face in front of the camera
4. You should see:
   - Your video feed
   - Facial landmarks overlay
   - Detected emotion (happy, sad, angry, etc.)
   - Confidence percentage

## Common Issues & Quick Fixes

### Issue: "Library not loaded" error

**Cause:** face-api.js didn't load (CDN blocked or local file missing)

**Fix:**
1. Check if `assets/js/face-api.min.js` exists and is ~649KB
2. Disable ad-blockers/browser extensions temporarily
3. Refresh the page

### Issue: "Models failed to load"

**Cause:** Not using web server or CORS restrictions

**Fix:**
1. ✅ Make sure you're using `http://localhost:8080` (not `file://`)
2. ✅ Verify web server is running
3. ✅ Check models/ directory has 9 files
4. ✅ Try a different web server (Python, Node, PHP)

### Issue: Camera permission denied

**Fix:**
1. Click the camera icon in the browser address bar
2. Select "Allow"
3. Refresh the page
4. Try clicking "Start Detection" again

### Issue: "Camera already in use"

**Fix:**
1. Close Zoom, Teams, Skype, or any video conferencing app
2. Close other browser tabs using the camera
3. Refresh the page
4. If still not working, restart your browser

### Issue: No camera found

**Fix:**
1. Connect a webcam if using a desktop
2. Check if camera is enabled in system settings
3. Try a different browser
4. Check Device Manager (Windows) or System Preferences (Mac)

## Testing Your Setup

Open browser console (press F12) and run:

```javascript
// Check if library is loaded
console.log('Library loaded:', typeof faceapi !== 'undefined');

// Check if models are accessible
fetch('./models/tiny_face_detector_model-weights_manifest.json')
  .then(r => console.log('Models accessible:', r.ok))
  .catch(e => console.error('Models error:', e));

// Check if camera is available
navigator.mediaDevices.getUserMedia({video: true})
  .then(() => console.log('Camera OK'))
  .catch(e => console.error('Camera error:', e));
```

All three should return positive results.

## Browser Console Debugging

If something doesn't work:

1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Look for red error messages
4. Common errors and their meanings:

   - `faceapi is not defined` → Library not loaded
   - `Failed to load resource: 404` → Models not found
   - `NotAllowedError` → Camera permission denied
   - `NotFoundError` → No camera device
   - `NotReadableError` → Camera in use by another app

## Still Not Working?

See the comprehensive [Troubleshooting Guide](TROUBLESHOOTING_FACIAL_DETECTION.md) for:
- Detailed explanations of each error
- Step-by-step debugging procedures
- Advanced troubleshooting techniques
- Browser-specific instructions

## Next Steps

Once facial detection is working:

1. Try different facial expressions
2. Check the emotion detection accuracy
3. Look at the confidence scores
4. Explore the intervention recommendations
5. View your mood history

## Performance Tips

For best results:
- ✅ Good lighting (face the light source)
- ✅ Position face clearly in frame
- ✅ Look directly at camera
- ✅ Stay relatively still
- ✅ Use a decent quality webcam (720p+)
- ✅ Close unnecessary browser tabs

## Privacy Note

All facial detection happens **locally in your browser**. No video, images, or facial data is sent to any server or stored anywhere. Everything is processed in real-time using JavaScript.

## Support

Need help?
- Check [README.md](README.md) for general information
- See [TROUBLESHOOTING_FACIAL_DETECTION.md](TROUBLESHOOTING_FACIAL_DETECTION.md) for detailed troubleshooting
- Open an issue on GitHub with:
  - Your browser and OS
  - Console error messages
  - Output of `verify-setup.sh`
