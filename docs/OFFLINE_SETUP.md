# Setting Up Facial Detection for Offline Use

By default, the application loads the face-api.js library from a CDN (Content Delivery Network), which requires an internet connection. If you need to use the facial detection feature offline, follow these steps:

## Prerequisites

- Node.js and npm installed on your system
- Git (optional, for cloning)

## Option 1: Using npm to Install face-api.js Locally

1. Initialize npm in your project directory (if not already done):
   ```bash
   npm init -y
   ```

2. Install face-api.js:
   ```bash
   npm install face-api.js
   ```

3. Copy the face-api.js distribution file to your project root:
   ```bash
   cp node_modules/face-api.js/dist/face-api.min.js ./face-api.min.js
   ```

4. Update `index.html` to use the local copy instead of CDN:
   
   Change this line:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/face-api.js"></script>
   ```
   
   To:
   ```html
   <script src="./face-api.min.js"></script>
   ```

5. Serve the application using a web server (required):
   ```bash
   python -m http.server 8080
   # or
   npx http-server
   ```

## Option 2: Manual Download

1. Download face-api.js from the official repository:
   - Visit: https://github.com/justadudewhohacks/face-api.js
   - Download the `dist/face-api.min.js` file
   - Or download directly: https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js

2. Save the file as `face-api.min.js` in your project root directory

3. Update `index.html` as described in Option 1, step 4

4. Serve the application as described in Option 1, step 5

## Models

The pre-trained models required for facial emotion detection are already included in the `models/` directory (~7MB total). These include:

- Tiny Face Detector
- Face Landmark 68
- Face Recognition
- Face Expression

No additional setup is needed for the models.

## Verification

After setup, verify everything is working:

1. Open the browser console (F12)
2. Navigate to the application
3. Click on "Start Detection" button
4. Check console for any errors
5. Grant camera permissions when prompted

You should see:
- "Loading face-api.js models from ./models directory..." 
- "All face-api.js models loaded successfully"
- Camera feed with emotion detection overlay

## Troubleshooting

**Issue: "faceapi is not defined"**
- The face-api.js library failed to load
- Ensure the script tag is correct in index.html
- Check browser console for loading errors
- Verify the file path is correct

**Issue: Models not loading**
- Ensure the `models/` directory exists in the same directory as index.html
- Check file permissions
- Verify all model files are present (9 files total)

## Notes

- The application MUST be served through a web server (HTTP/HTTPS)
- Opening the HTML file directly (file://) will not work due to CORS restrictions
- Camera access requires HTTPS or localhost
- Some browsers may have stricter security policies

## Recommended: Using CDN (Default)

For most users, using the CDN version (default) is recommended because:
- No additional setup required
- Automatically gets updates
- Smaller initial download size
- Better caching across websites

Only use the offline setup if:
- You need to work without internet connection
- Your organization blocks CDNs
- You need a specific version of face-api.js
