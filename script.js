// Global variables
let currentStep = 'landing';
let detectedEmotions = [];
let faceDetectionInterval;
let emotionHistory = [];
const HISTORY_MAX_LENGTH = 5;

// Facial detection configuration
const ERROR_MESSAGE_TIMEOUT = 8000; // Time in ms to show error before returning to landing
const MODEL_PATHS = ['./models', '/models', 'models']; // Paths to try for loading models
const ERROR_PREFIX_LIBRARY = 'LIBRARY_NOT_LOADED:'; // Error prefix for library loading failures
const ERROR_PREFIX_MODELS = 'MODEL_LOAD_FAILED:'; // Error prefix for model loading failures

// Chatbot variables
let chatHistory = [];
let userData = null;
let chatAnalysis = {
    messageCount: 0,
    detectedEmotions: [],
    topics: [],
    overallSentiment: 'neutral',
    riskLevel: 'low'
};

// Chatbot typing delay constants (in milliseconds)
const TYPING_DELAY_MIN = 1000;
const TYPING_DELAY_MAX = 2000;

// API Base URL (for backend integration)
// Auto-detect environment: use production backend URL if deployed, otherwise use localhost
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://mental-health-backend.onrender.com/api'; // Update this URL when you deploy the backend

// DOM Elements
const landingSection = document.getElementById('landing-section');
const detectionSection = document.getElementById('detection-section');
const interventionSection = document.getElementById('intervention-section');
const historySection = document.getElementById('history-section');
const questionnaireSection = document.getElementById('questionnaire-section');
const textAnalysisSection = document.getElementById('text-analysis-section');
const textResultsSection = document.getElementById('text-results-section');
const questionnaireResultsSection = document.getElementById('questionnaire-results-section');
const chatbotRegistrationSection = document.getElementById('chatbot-registration-section');
const chatbotSection = document.getElementById('chatbot-section');
const reportSection = document.getElementById('report-section');

const startCheckBtn = document.getElementById('start-check-btn');
const startQuestionnaireBtn = document.getElementById('start-questionnaire-btn');
const startTextBtn = document.getElementById('start-text-btn');
const startChatbotBtn = document.getElementById('start-chatbot-btn');
const submitQuestionnaireBtn = document.getElementById('submit-questionnaire-btn');
const analyzeTextBtn = document.getElementById('analyze-text-btn');
const backBtn = document.getElementById('back-btn');
const continueBtn = document.getElementById('continue-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeShutter = document.getElementById('theme-shutter');

// Chatbot elements
const userRegistrationForm = document.getElementById('user-registration-form');
const chatMessagesContainer = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const generateReportBtn = document.getElementById('generate-report-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const logoutBtn = document.getElementById('logout-btn');
const downloadReportBtn = document.getElementById('download-report-btn');
const backToChatBtn = document.getElementById('back-to-chat-btn');
const existingAccountNotice = document.getElementById('existing-account-notice');
const continueExistingBtn = document.getElementById('continue-existing-btn');
const createNewAccountBtn = document.getElementById('create-new-account-btn');
const existingUserNameSpan = document.getElementById('existing-user-name');
const userNameDisplay = document.getElementById('user-name-display');

// Modal elements
const confirmationModal = document.getElementById('confirmation-modal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

const webcamElement = document.getElementById('webcam');
const overlayCanvas = document.getElementById('overlay');
const loadingIndicator = document.getElementById('loading-indicator');
const emotionText = document.getElementById('emotion-text');
const confidenceText = document.getElementById('confidence');
const emotionSummary = document.getElementById('emotion-summary');
const recommendationContent = document.getElementById('recommendation-content');
const exercisesContent = document.getElementById('exercises-content');
const moodHistoryContainer = document.getElementById('mood-history-container');

// Text analysis elements
const feelingsText = document.getElementById('feelings-text');
const wordCountDisplay = document.getElementById('word-count');
const charCountDisplay = document.getElementById('char-count');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Initialize the application
function initApp() {
    // Set up event listeners
    startCheckBtn.addEventListener('click', startDetection);
    startQuestionnaireBtn.addEventListener('click', startQuestionnaire);
    startTextBtn.addEventListener('click', startTextAnalysis);
    if (startChatbotBtn) startChatbotBtn.addEventListener('click', startChatbot);
    submitQuestionnaireBtn.addEventListener('click', submitQuestionnaire);
    analyzeTextBtn.addEventListener('click', analyzeText);
    backBtn.addEventListener('click', navigateBack);
    continueBtn.addEventListener('click', navigateForward);

    // Chatbot event listeners
    if (userRegistrationForm) userRegistrationForm.addEventListener('submit', handleUserRegistration);
    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendChatMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
    if (generateReportBtn) generateReportBtn.addEventListener('click', generateReport);
    if (clearChatBtn) clearChatBtn.addEventListener('click', clearChat);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (downloadReportBtn) downloadReportBtn.addEventListener('click', downloadReport);
    if (backToChatBtn) backToChatBtn.addEventListener('click', backToChat);
    if (continueExistingBtn) continueExistingBtn.addEventListener('click', continueWithExistingAccount);
    if (createNewAccountBtn) createNewAccountBtn.addEventListener('click', createNewAccount);
    
    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (chatInput) {
                chatInput.value = chip.dataset.message;
                sendChatMessage();
            }
        });
    });

    // Animated theme toggle
    themeToggleBtn.addEventListener('click', animatedThemeToggle);
    
    // Text input listeners
    if (feelingsText) {
        feelingsText.addEventListener('input', updateTextStats);
    }
    
    // Create toast container for notifications
    createToastContainer();
    
    // Add event delegation for radio button selection styling
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio' && e.target.closest('.answer-options')) {
            const group = e.target.name;
            // Remove selected class from all labels in this group
            document.querySelectorAll(`input[name="${group}"]`).forEach(input => {
                input.closest('label').classList.remove('selected');
            });
            // Add selected class to the checked label
            e.target.closest('label').classList.add('selected');
        }
    });

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Load emotion history from localStorage
    loadEmotionHistory();
    
    // Load user data and chat history from localStorage
    loadUserData();
    loadChatHistory();

    // Create dynamic shooting stars for dark mode
    createShootingStars(10);
}

// =====================================================
// MODAL HELPER FUNCTIONS
// =====================================================

// Show confirmation modal
function showConfirmationModal(title, message) {
    return new Promise((resolve) => {
        if (modalTitle) modalTitle.textContent = title;
        if (modalDescription) modalDescription.textContent = message;
        
        let escapeHandler, outsideClickHandler, confirmHandler, cancelHandler, contentClickHandler;
        const modalContent = confirmationModal?.querySelector('.modal-content');
        
        const cleanup = () => {
            // Remove all event listeners
            if (escapeHandler) document.removeEventListener('keydown', escapeHandler);
            if (outsideClickHandler && confirmationModal) confirmationModal.removeEventListener('click', outsideClickHandler);
            if (confirmHandler && modalConfirmBtn) modalConfirmBtn.removeEventListener('click', confirmHandler);
            if (cancelHandler && modalCancelBtn) modalCancelBtn.removeEventListener('click', cancelHandler);
            if (contentClickHandler && modalContent) modalContent.removeEventListener('click', contentClickHandler);
        };
        
        confirmHandler = (e) => {
            e.stopPropagation(); // Prevent event from bubbling to overlay
            hideConfirmationModal();
            cleanup();
            resolve(true);
        };
        
        cancelHandler = (e) => {
            e.stopPropagation(); // Prevent event from bubbling to overlay
            hideConfirmationModal();
            cleanup();
            resolve(false);
        };
        
        // Prevent clicks inside modal content from closing the modal
        contentClickHandler = (e) => {
            e.stopPropagation();
        };
        
        // Add event listeners
        if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', confirmHandler);
        if (modalCancelBtn) modalCancelBtn.addEventListener('click', cancelHandler);
        if (modalContent) modalContent.addEventListener('click', contentClickHandler);
        
        // Handle escape key
        escapeHandler = (e) => {
            if (e.key === 'Escape') {
                hideConfirmationModal();
                cleanup();
                resolve(false);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Handle clicking outside modal
        outsideClickHandler = (e) => {
            if (e.target === confirmationModal) {
                hideConfirmationModal();
                cleanup();
                resolve(false);
            }
        };
        if (confirmationModal) {
            confirmationModal.addEventListener('click', outsideClickHandler);
        }
        
        if (confirmationModal) {
            confirmationModal.classList.remove('hidden');
            // Focus on the confirm button for accessibility
            if (modalConfirmBtn) modalConfirmBtn.focus();
        }
    });
}

// Hide confirmation modal
function hideConfirmationModal() {
    if (confirmationModal) {
        confirmationModal.classList.add('hidden');
    }
}

// Function to create random shooting stars
function createShootingStars(num) {
    for (let i = 0; i < num; i++) {
        const star = document.createElement('span');
        star.classList.add('shooting-star');

        // Random position
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';

        // Random rotation for direction
        const angle = Math.random() * 360;
        star.style.setProperty('--rotation', angle + 'deg');

        // Random size
        const size = 1 + Math.random() * 2; // 1-3px
        star.style.setProperty('--size', size + 'px');

        // Random trail length
        const trailLength = 100 + Math.random() * 200; // 100-300px
        star.style.setProperty('--trail-length', trailLength + 'px');

        // Random cycle duration for infrequent appearances (10-60s)
        const cycleDur = 10 + Math.random() * 50;
        star.style.animationDuration = cycleDur + 's';

        // Random initial delay (negative for starting at random point in animation)
        const delay = Math.random() * cycleDur;
        star.style.animationDelay = '-' + delay + 's';

        document.body.appendChild(star);
    }
}

// Animated day/night shutter toggle
function animatedThemeToggle() {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
        // Direct toggle without animation
        toggleTheme();
        return;
    }

    // Set shutter color based on incoming theme
    const goingToDark = !document.body.classList.contains('dark-theme');
    // color for closing overlay
    themeShutter.style.background = goingToDark ? '#0b1220' : '#f7faff';

    // Run shutter animation
    themeShutter.classList.remove('run'); // reset in case
    // Force reflow to restart animation
    // eslint-disable-next-line no-unused-expressions
    themeShutter.offsetHeight;
    themeShutter.classList.add('run');

    // Toggle theme midway through the shutter animation
    setTimeout(() => {
        toggleTheme();
    }, 300); // matches shutter-pop 40% mark

    // Cleanup after animation ends (safety timeout)
    setTimeout(() => {
        themeShutter.classList.remove('run');
    }, 800);
}

// Toggle between dark and light themes (no DOM innerHTML changes to keep button structure)
function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Start the detection process
async function startDetection() {
    showSection(detectionSection);
    hideSection(landingSection);

    currentStep = 'detection';
    updateNavigationButtons();

    try {
        // Show loader
        loadingIndicator.classList.remove('hidden');
        loadingIndicator.innerHTML = '<div class="spinner"></div><p>Loading AI models...</p>';

        // Load face-api models
        await loadModels();

        // Update loader message
        loadingIndicator.innerHTML = '<div class="spinner"></div><p>Requesting camera access...</p>';

        // Access webcam
        await startWebcam();

        // Start face detection
        startFaceDetection();
    } catch (error) {
        console.error('Error starting detection:', error);
        loadingIndicator.classList.add('hidden');
        
        // Provide specific error messages based on error type
        let errorMessage = 'An error occurred while starting the detection process.';
        
        // Check for specific error types
        if (error.message.startsWith(ERROR_PREFIX_LIBRARY)) {
            errorMessage = '⚠️ Face-API.js Library Not Loaded\n\n' +
                'The face-api.js library could not be loaded. This is usually because:\n\n' +
                '1. CDN is blocked by your network/firewall/ad-blocker\n' +
                '2. The local library file is missing\n\n' +
                'Solutions:\n' +
                '✓ Disable ad-blockers for this site\n' +
                '✓ Check your network/firewall settings\n' +
                '✓ Ensure assets/js/face-api.min.js exists\n' +
                '✓ Try refreshing the page';
        } else if (error.message.startsWith(ERROR_PREFIX_MODELS)) {
            errorMessage = '⚠️ AI Models Failed to Load\n\n' +
                'The AI models could not be loaded. Common causes:\n\n' +
                '1. Application not served through a web server\n' +
                '2. CORS or file access restrictions\n' +
                '3. Models directory not accessible\n\n' +
                'Solutions:\n' +
                '✓ Use a web server (python -m http.server 8080)\n' +
                '✓ Do NOT open index.html directly (file://)\n' +
                '✓ Access via http://localhost:8080\n' +
                '✓ Ensure models/ directory has all required files';
        } else if (error.message.includes('webcam') || error.message.includes('camera')) {
            errorMessage = '⚠️ Camera Access Error\n\n' +
                'Unable to access your camera:\n\n' +
                '✓ Grant camera permissions in browser\n' +
                '✓ Close other apps using the camera\n' +
                '✓ Use HTTPS or localhost (not file://)\n' +
                '✓ Check browser supports camera API';
        } else if (error.name === 'NotAllowedError') {
            errorMessage = '⚠️ Camera Permission Denied\n\n' +
                'You blocked camera access. To fix:\n\n' +
                '1. Click the camera icon in address bar\n' +
                '2. Change permission to "Allow"\n' +
                '3. Refresh and try again';
        } else if (error.name === 'NotFoundError') {
            errorMessage = '⚠️ No Camera Detected\n\n' +
                'No camera device found on your system.\n\n' +
                '✓ Connect a webcam\n' +
                '✓ Check camera is enabled in BIOS\n' +
                '✓ Try a different browser';
        } else if (error.name === 'NotReadableError') {
            errorMessage = '⚠️ Camera Already in Use\n\n' +
                'Another application is using your camera.\n\n' +
                '✓ Close other video apps (Zoom, Teams, etc.)\n' +
                '✓ Close other browser tabs using camera\n' +
                '✓ Restart your browser';
        }
        
        showToast(errorMessage, 'error');
        
        // Return to landing page after error
        setTimeout(() => {
            showSection(landingSection);
            hideSection(detectionSection);
            currentStep = 'landing';
            updateNavigationButtons();
        }, ERROR_MESSAGE_TIMEOUT);
    }
}

// Load face-api.js models
async function loadModels() {
    try {
        // Check if face-api.js library is loaded
        if (typeof faceapi === 'undefined') {
            throw new Error(`${ERROR_PREFIX_LIBRARY} Face-api.js library could not be loaded. This may be due to blocked CDN access or missing local files.`);
        }
        
        console.log('Loading face-api.js models from ./models directory...');
        console.log('Attempting to load models with multiple path strategies...');
        
        // Try loading with different path strategies
        let lastError = null;
        
        for (const modelPath of MODEL_PATHS) {
            try {
                console.log(`Trying model path: ${modelPath}`);
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
                    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
                    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
                    faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
                ]);
                
                console.log(`All face-api.js models loaded successfully from: ${modelPath}`);
                return true;
            } catch (error) {
                console.warn(`Failed to load models from ${modelPath}:`, error);
                lastError = error;
                // Continue to next path
            }
        }
        
        // If we get here, all paths failed
        console.error('Failed to load models from all attempted paths');
        console.error('Last error:', lastError);
        throw new Error(`${ERROR_PREFIX_MODELS} Failed to load AI models from the models directory. Please ensure you are running the application through a web server (not file://) and the models directory is accessible.`);
    } catch (error) {
        console.error('Error loading models:', error);
        
        // Re-throw with specific error type if it's already marked
        if (error.message.startsWith(ERROR_PREFIX_LIBRARY) || error.message.startsWith(ERROR_PREFIX_MODELS)) {
            throw error;
        }
        
        // Otherwise, wrap it as a model load failure
        throw new Error(`${ERROR_PREFIX_MODELS} ${error.message}`);
    }
}

// Start webcam access
async function startWebcam() {
    try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Edge.');
        }
        
        console.log('Requesting camera access...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });
        
        console.log('Camera access granted');
        webcamElement.srcObject = stream;

        return new Promise((resolve, reject) => {
            webcamElement.onloadedmetadata = () => {
                console.log('Video metadata loaded, starting playback');
                webcamElement.play()
                    .then(() => {
                        console.log('Video playback started successfully');
                        resolve(true);
                    })
                    .catch((playError) => {
                        console.error('Error playing video:', playError);
                        reject(new Error('Failed to start video playback'));
                    });
            };
            
            webcamElement.onerror = (error) => {
                console.error('Video element error:', error);
                reject(new Error('Failed to load video stream'));
            };
            
            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('Camera initialization timed out'));
            }, 10000);
        });
    } catch (error) {
        console.error('Error accessing webcam:', error);
        
        // Preserve the original error for better debugging
        if (error.name) {
            throw error;
        }
        
        throw new Error('Failed to access webcam. Please ensure camera permissions are granted.');
    }
}

// Start face detection
function startFaceDetection() {
    const canvas = overlayCanvas;
    
    // Hide loading indicator once detection starts
    loadingIndicator.classList.add('hidden');
    
    console.log('Starting face detection loop...');

    faceDetectionInterval = setInterval(async () => {
        // Use actual video dimensions
        const displayWidth = webcamElement.videoWidth || 640;
        const displayHeight = webcamElement.videoHeight || 480;

        // Ensure canvas matches video size
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        try {
            const detections = await faceapi
                .detectAllFaces(webcamElement, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            const displaySize = { width: displayWidth, height: displayHeight };
            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            // Clear the canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw detections
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            // Process detected emotions
            if (detections.length > 0) {
                const expressions = detections[0].expressions;
                processEmotions(expressions);
            } else {
                emotionText.textContent = 'No face detected';
                confidenceText.textContent = '';
            }
        } catch (detectionError) {
            console.error('Error during face detection:', detectionError);
            // Continue running even if one frame fails
        }
    }, 120);

    // Enable continue button after 3 seconds of detection
    setTimeout(() => {
        continueBtn.classList.remove('hidden');
    }, 3000);
}

// Process detected emotions
function processEmotions(expressions) {
    // Get the most confident emotion
    let maxConfidence = 0;
    let maxEmotion = '';

    for (const [emotion, confidence] of Object.entries(expressions)) {
        if (confidence > maxConfidence) {
            maxConfidence = confidence;
            maxEmotion = emotion;
        }
    }

    // Update the UI
    emotionText.textContent = formatEmotionName(maxEmotion);
    confidenceText.textContent = `(${Math.round(maxConfidence * 100)}% confidence)`;

    // Clear existing emotion classes
    const emotionClasses = [
        'emotion-happy', 'emotion-sad', 'emotion-angry',
        'emotion-fearful', 'emotion-surprised', 'emotion-disgusted', 'emotion-neutral'
    ];
    emotionText.classList.remove(...emotionClasses);

    // Add appropriate emotion class
    emotionText.classList.add(`emotion-${maxEmotion}`);

    // Store the emotion
    detectedEmotions.push({
        emotion: maxEmotion,
        confidence: maxConfidence,
        timestamp: new Date().toISOString()
    });
}

// Format emotion name for display
function formatEmotionName(emotion) {
    if (!emotion) return 'Unknown';
    const formatted = emotion.charAt(0).toUpperCase() + emotion.slice(1);
    return formatted;
}

// Navigate back to the previous section
function navigateBack() {
    switch (currentStep) {
        case 'detection':
            stopDetection();
            showSection(landingSection);
            hideSection(detectionSection);
            currentStep = 'landing';
            break;
        case 'intervention':
            showSection(detectionSection);
            hideSection(interventionSection);
            currentStep = 'detection';
            startFaceDetection(); // Resume detection
            break;
        case 'history':
            showSection(interventionSection);
            hideSection(historySection);
            currentStep = 'intervention';
            break;
        case 'questionnaire':
            showSection(landingSection);
            hideSection(questionnaireSection);
            currentStep = 'landing';
            break;
        case 'questionnaire-results':
            showSection(questionnaireSection);
            hideSection(questionnaireResultsSection);
            currentStep = 'questionnaire';
            break;
        case 'text-analysis':
            showSection(landingSection);
            hideSection(textAnalysisSection);
            currentStep = 'landing';
            break;
        case 'text-results':
            showSection(textAnalysisSection);
            hideSection(textResultsSection);
            currentStep = 'text-analysis';
            break;
        case 'chatbot-registration':
            showSection(landingSection);
            hideSection(chatbotRegistrationSection);
            currentStep = 'landing';
            break;
        case 'chatbot':
            showSection(landingSection);
            hideSection(chatbotSection);
            currentStep = 'landing';
            break;
        case 'report':
            showSection(chatbotSection);
            hideSection(reportSection);
            currentStep = 'chatbot';
            break;
    }

    updateNavigationButtons();
}

// Navigate forward to the next section
function navigateForward() {
    switch (currentStep) {
        case 'detection':
            stopDetection();
            generateIntervention();
            showSection(interventionSection);
            hideSection(detectionSection);
            currentStep = 'intervention';
            break;
        case 'intervention':
            updateMoodHistory();
            showSection(historySection);
            hideSection(interventionSection);
            currentStep = 'history';
            break;
        case 'history':
            // Reset the flow
            showSection(landingSection);
            hideSection(historySection);
            currentStep = 'landing';
            break;
        case 'questionnaire-results':
            showSection(interventionSection);
            hideSection(questionnaireResultsSection);
            generateInterventionFromQuestionnaire();
            currentStep = 'intervention';
            break;
        case 'text-results':
            showSection(interventionSection);
            hideSection(textResultsSection);
            generateInterventionFromText();
            currentStep = 'intervention';
            break;
    }

    updateNavigationButtons();
}

// Stop the face detection process
function stopDetection() {
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }

    // Stop the webcam
    if (webcamElement.srcObject) {
        const tracks = webcamElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        webcamElement.srcObject = null;
    }
}

// Generate intervention based on detected emotions
function generateIntervention() {
    // Calculate the most frequent emotion
    const emotionCounts = {};
    detectedEmotions.forEach(item => {
        if (item.confidence > 0.5) { // Only count emotions with confidence > 50%
            emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
        }
    });

    // Get the most frequent emotion
    let dominantEmotion = 'neutral';
    let maxCount = 0;

    for (const [emotion, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
            maxCount = count;
            dominantEmotion = emotion;
        }
    }

    // Update the UI with appropriate intervention
    updateEmotionSummary(dominantEmotion);
    generateRecommendations(dominantEmotion);
    generateExercises(dominantEmotion);

    // Save this emotion to history
    const historyEntry = {
        emotion: dominantEmotion,
        timestamp: new Date().toISOString()
    };

    // Add to emotion history
    emotionHistory.unshift(historyEntry);

    // Keep only the last HISTORY_MAX_LENGTH entries
    if (emotionHistory.length > HISTORY_MAX_LENGTH) {
        emotionHistory = emotionHistory.slice(0, HISTORY_MAX_LENGTH);
    }

    // Save to localStorage
    localStorage.setItem('emotionHistory', JSON.stringify(emotionHistory));
}

// Update the emotion summary section
function updateEmotionSummary(emotion) {
    let summaryText = '';

    switch (emotion) {
        case 'happy':
            summaryText = "You're displaying signs of happiness and positive emotions. This is great for your mental well-being!";
            break;
        case 'sad':
            summaryText = "You appear to be experiencing sadness. It's normal to feel sad sometimes, but there are ways to help lift your mood.";
            break;
        case 'angry':
            summaryText = "You seem to be feeling angry or frustrated. Let's explore some ways to manage these emotions constructively.";
            break;
        case 'fearful':
            summaryText = "Your expressions suggest anxiety or fear. These are natural responses, but there are techniques to help you feel calmer.";
            break;
        case 'surprised':
            summaryText = "You look surprised or startled. This could be a momentary reaction, or you might be processing unexpected information.";
            break;
        case 'disgusted':
            summaryText = "You're showing expressions of discomfort or disgust. Let's work on addressing what might be causing these feelings.";
            break;
        default:
            summaryText = "Your expressions appear neutral. This could indicate calmness, but sometimes it might mask underlying emotions.";
    }

    emotionSummary.textContent = summaryText;
}

// Generate personalized recommendations
function generateRecommendations(emotion) {
    let recommendations = '';

    switch (emotion) {
        case 'happy':
            recommendations = `
                <div class="recommendation-item">
                    <h4>Maintain Your Positive State</h4>
                    <p>Your happiness is valuable! Consider these ideas to maintain this positive state:</p>
                    <ul>
                        <li>Express gratitude by writing down three things you're thankful for today</li>
                        <li>Share your positive energy with others through kind words or actions</li>
                        <li>Engage in activities you enjoy to prolong these positive feelings</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>Build Emotional Resilience</h4>
                    <p>While you're feeling good, it's a great time to build emotional resilience:</p>
                    <ul>
                        <li>Reflect on what contributes to your happiness</li>
                        <li>Practice mindfulness to fully experience positive moments</li>
                        <li>Consider starting a happiness journal to track what brings you joy</li>
                    </ul>
                </div>
            `;
            break;
        case 'sad':
            recommendations = `
                <div class="recommendation-item">
                    <h4>Gentle Self-Care</h4>
                    <p>When feeling sad, it's important to be gentle with yourself:</p>
                    <ul>
                        <li>Allow yourself to feel your emotions without judgment</li>
                        <li>Engage in small acts of self-care like taking a warm shower or having your favorite tea</li>
                        <li>Reach out to a trusted friend or family member</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>Mood Elevation Strategies</h4>
                    <p>These activities can help lift your mood:</p>
                    <ul>
                        <li>Take a short walk in nature</li>
                        <li>Listen to uplifting music or watch a funny video</li>
                        <li>Practice gratitude by noting one positive thing in your day</li>
                        <li>Consider speaking with a mental health professional if sadness persists</li>
                    </ul>
                </div>
            `;
            break;
        case 'angry':
            recommendations = `
                <div class="recommendation-item">
                    <h4>Healthy Expression</h4>
                    <p>Anger is a natural emotion that needs healthy outlets:</p>
                    <ul>
                        <li>Take a moment to step away from triggering situations</li>
                        <li>Practice deep breathing to calm your nervous system</li>
                        <li>Write down your thoughts to process them constructively</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>Long-term Anger Management</h4>
                    <p>Consider these strategies for managing anger more effectively:</p>
                    <ul>
                        <li>Identify specific triggers and patterns in your anger responses</li>
                        <li>Practice regular physical exercise to release tension</li>
                        <li>Learn communication techniques to express needs assertively</li>
                        <li>Consider anger management resources if anger affects your daily life</li>
                    </ul>
                </div>
            `;
            break;
        case 'fearful':
            recommendations = `
                <div class="recommendation-item">
                    <h4>Grounding Techniques</h4>
                    <p>When feeling anxious or fearful, try these grounding methods:</p>
                    <ul>
                        <li>Practice the 5-4-3-2-1 technique: name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste</li>
                        <li>Focus on slow, deep breathing</li>
                        <li>Place your feet firmly on the ground and notice the sensation</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>Understanding Anxiety</h4>
                    <p>Consider these approaches to manage anxiety:</p>
                    <ul>
                        <li>Identify specific fears and challenge catastrophic thinking</li>
                        <li>Practice progressive muscle relaxation</li>
                        <li>Consider mindfulness meditation or yoga</li>
                        <li>Seek professional support for persistent anxiety</li>
                    </ul>
                </div>
            `;
            break;
        case 'surprised':
            recommendations = `
                <div class="recommendation-item">
                    <h4>Processing Unexpected Events</h4>
                    <p>Surprise can sometimes be unsettling. Try these approaches:</p>
                    <ul>
                        <li>Take a moment to pause and ground yourself</li>
                        <li>Process what surprised you and why</li>
                        <li>Consider journaling about your reaction</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>Adapting to Change</h4>
                    <p>If surprise relates to unexpected changes:</p>
                    <ul>
                        <li>Focus on what aspects you can control</li>
                        <li>Practice flexibility in your thinking</li>
                        <li>Consider what opportunities might arise from change</li>
                    </ul>
                </div>
            `;
            break;
        case 'disgusted':
            recommendations = `
                <div class="recommendation-item">
                    <h4>Processing Discomfort</h4>
                    <p>When feeling disgusted or uncomfortable:</p>
                    <ul>
                        <li>Identify what triggered this feeling</li>
                        <li>Practice mindful acceptance of the emotion without judgment</li>
                        <li>Consider if you need to set boundaries in certain situations</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>Comfort Restoration</h4>
                    <p>Try these techniques to restore comfort:</p>
                    <ul>
                        <li>Engage your senses with pleasant stimuli (favorite scents, music, etc.)</li>
                        <li>Practice self-compassion</li>
                        <li>Consider if discussing your feelings with someone would help</li>
                    </ul>
                </div>
            `;
            break;
        default: // neutral
            recommendations = `
                <div class="recommendation-item">
                    <h4>Emotional Awareness</h4>
                    <p>A neutral expression might indicate balance, or sometimes mask underlying feelings:</p>
                    <ul>
                        <li>Take a moment for an emotional check-in with yourself</li>
                        <li>Consider journaling to explore any subtle emotions you might be experiencing</li>
                        <li>Practice mindfulness to enhance emotional awareness</li>
                    </ul>
                </div>
                <div class="recommendation-item">
                    <h4>Emotional Wellness</h4>
                    <p>Even when feeling neutral, you can support your emotional health:</p>
                    <ul>
                        <li>Engage in activities that bring you joy</li>
                        <li>Connect with others socially</li>
                        <li>Maintain healthy habits like adequate sleep, nutrition, and exercise</li>
                    </ul>
                </div>
            `;
    }

    recommendationContent.innerHTML = recommendations;
}

// Generate appropriate exercises
function generateExercises(emotion) {
    let exercises = '';

    // Common exercises for different emotions
    switch (emotion) {
        case 'sad':
        case 'fearful':
            exercises = `
                <div class="exercise-item">
                    <h4>Breathing Exercise</h4>
                    <div class="breathing-circle"></div>
                    <p class="breathing-text">Breathe in as the circle expands, breathe out as it contracts</p>
                    <p>Practice this for 2-3 minutes</p>
                </div>
                <div class="exercise-item">
                    <h4>Positive Visualization</h4>
                    <p>Close your eyes and visualize a place where you feel safe and calm. Notice the details:</p>
                    <ul>
                        <li>What do you see?</li>
                        <li>What sounds do you hear?</li>
                        <li>What can you feel (temperature, textures)?</li>
                    </ul>
                    <p>Spend 3-5 minutes in this mental safe space.</p>
                </div>
            `;
            break;
        case 'angry':
            exercises = `
                <div class="exercise-item">
                    <h4>Progressive Muscle Relaxation</h4>
                    <p>Tense and then relax each muscle group in your body:</p>
                    <ol>
                        <li>Start with your feet and toes - tense for 5 seconds, then release</li>
                        <li>Move to your calves - tense for 5 seconds, then release</li>
                        <li>Continue upward through your body</li>
                        <li>End with your facial muscles</li>
                    </ol>
                    <p>Notice how your body feels different after completing this exercise.</p>
                </div>
                <div class="exercise-item">
                    <h4>Thought Challenge</h4>
                    <p>When angry, we often have automatic negative thoughts. Challenge them:</p>
                    <ol>
                        <li>Identify the thought causing anger</li>
                        <li>Ask: Is this thought based on facts or assumptions?</li>
                        <li>Consider alternative perspectives</li>
                        <li>Create a more balanced thought</li>
                    </ol>
                </div>
            `;
            break;
        case 'happy':
            exercises = `
                <div class="exercise-item">
                    <h4>Gratitude Practice</h4>
                    <p>Enhance your positive emotions with gratitude:</p>
                    <ol>
                        <li>Take a moment to write down 3 things you're grateful for today</li>
                        <li>For each item, write why it brings you joy</li>
                        <li>Consider expressing gratitude to someone who contributed to your happiness</li>
                    </ol>
                </div>
                <div class="exercise-item">
                    <h4>Savoring Exercise</h4>
                    <p>Enhance positive emotions by savoring good experiences:</p>
                    <ol>
                        <li>Choose a positive moment from today</li>
                        <li>Close your eyes and mentally revisit it in detail</li>
                        <li>Notice all sensory aspects of the memory</li>
                        <li>Acknowledge how this memory affects you physically and emotionally</li>
                    </ol>
                </div>
            `;
            break;
        default:
            exercises = `
                <div class="exercise-item">
                    <h4>Mindful Observation</h4>
                    <p>Choose an object in your environment:</p>
                    <ol>
                        <li>Focus all your attention on this object for 2 minutes</li>
                        <li>Observe its colors, textures, shapes, and other details</li>
                        <li>When your mind wanders, gently bring attention back</li>
                    </ol>
                    <p>This practice helps build present-moment awareness and attention control.</p>
                </div>
                <div class="exercise-item">
                    <h4>Body Scan</h4>
                    <p>A gentle practice to connect with your physical sensations:</p>
                    <ol>
                        <li>Sit or lie in a comfortable position</li>
                        <li>Bring attention to your feet and notice any sensations</li>
                        <li>Slowly move your attention upward through your body</li>
                        <li>Notice sensations without trying to change them</li>
                    </ol>
                    <p>This practice helps develop body awareness and can reveal emotions held in the body.</p>
                </div>
            `;
    }

    exercisesContent.innerHTML = exercises;
}

// Update the mood history section
function updateMoodHistory() {
    moodHistoryContainer.innerHTML = '';

    if (emotionHistory.length === 0) {
        moodHistoryContainer.innerHTML = '<p>No mood history available yet.</p>';
        return;
    }

    emotionHistory.forEach((entry) => {
        const date = new Date(entry.timestamp);
        const formattedDate = date.toLocaleString();

        const moodCard = document.createElement('div');
        moodCard.className = 'mood-card';
        moodCard.innerHTML = `
            <p class="mood-card-date">${formattedDate}</p>
            <p class="mood-card-emotion emotion-${entry.emotion}">${formatEmotionName(entry.emotion)}</p>
            <p>${getEmotionDescription(entry.emotion)}</p>
        `;

        moodHistoryContainer.appendChild(moodCard);
    });
}

// Get description for emotion in history
function getEmotionDescription(emotion) {
    switch (emotion) {
        case 'happy': return 'You were feeling positive and cheerful.';
        case 'sad': return 'You were experiencing feelings of sadness.';
        case 'angry': return 'You were feeling frustrated or angry.';
        case 'fearful': return 'You were experiencing anxiety or fear.';
        case 'surprised': return 'You were feeling surprised or startled.';
        case 'disgusted': return 'You were experiencing discomfort.';
        case 'neutral': return 'Your emotions appeared balanced or neutral.';
        default: return 'Emotion not recognized.';
    }
}

// Load emotion history from localStorage
function loadEmotionHistory() {
    const savedHistory = localStorage.getItem('emotionHistory');
    if (savedHistory) {
        emotionHistory = JSON.parse(savedHistory);
    }
}

// Helper functions for showing/hiding sections
function showSection(section) {
    section.classList.remove('hidden');
}

function hideSection(section) {
    section.classList.add('hidden');
}

// Update navigation buttons based on current step
function updateNavigationButtons() {
    backBtn.classList.add('hidden');
    continueBtn.classList.add('hidden');

    switch (currentStep) {
        case 'landing':
            // No navigation buttons on landing page
            break;
        case 'detection':
            backBtn.classList.remove('hidden');
            break;
        case 'intervention':
            backBtn.classList.remove('hidden');
            continueBtn.classList.remove('hidden');
            continueBtn.innerHTML = 'View History <i class="fas fa-arrow-right"></i>';
            break;
        case 'history':
            backBtn.classList.remove('hidden');
            continueBtn.classList.remove('hidden');
            continueBtn.innerHTML = 'Start Over <i class="fas fa-redo"></i>';
            break;
        case 'questionnaire':
            backBtn.classList.remove('hidden');
            break;
        case 'questionnaire-results':
            backBtn.classList.remove('hidden');
            continueBtn.classList.remove('hidden');
            continueBtn.innerHTML = 'View Recommendations <i class="fas fa-arrow-right"></i>';
            break;
        case 'text-analysis':
            backBtn.classList.remove('hidden');
            break;
        case 'text-results':
            backBtn.classList.remove('hidden');
            continueBtn.classList.remove('hidden');
            continueBtn.innerHTML = 'View Recommendations <i class="fas fa-arrow-right"></i>';
            break;
        case 'chatbot-registration':
            backBtn.classList.remove('hidden');
            break;
        case 'chatbot':
            backBtn.classList.remove('hidden');
            break;
        case 'report':
            // Navigation handled by report buttons
            break;
    }
}

// Create placeholder for face-api models directory
// This simulates the models directory that should contain face-api.js models
// In a real environment, these would be downloaded from face-api.js GitHub

// =====================================================
// TOAST NOTIFICATION SYSTEM
// =====================================================

// Create toast container
function createToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconMap = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-exclamation-circle'
    };
    
    const colorMap = {
        info: '#5e72e4',
        success: '#2dce89',
        warning: '#fb6340',
        error: '#f5365c'
    };
    
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: var(--surface-color, white);
        border-left: 4px solid ${colorMap[type]};
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
        <i class="fas ${iconMap[type]}" style="color: ${colorMap[type]}; font-size: 1.2rem;"></i>
        <span style="color: var(--text-color, #333);">${message}</span>
    `;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// =====================================================
// QUESTIONNAIRE FUNCTIONALITY
// =====================================================

// Start the questionnaire assessment
function startQuestionnaire() {
    showSection(questionnaireSection);
    hideSection(landingSection);
    currentStep = 'questionnaire';
    updateNavigationButtons();
}

// Submit and analyze questionnaire responses
function submitQuestionnaire() {
    // Collect PHQ-9 responses
    const phq9Responses = [];
    for (let i = 1; i <= 9; i++) {
        const selected = document.querySelector(`input[name="phq9-${i}"]:checked`);
        if (selected) {
            phq9Responses.push(parseInt(selected.value));
        }
    }
    
    // Collect GAD-7 responses
    const gad7Responses = [];
    for (let i = 1; i <= 7; i++) {
        const selected = document.querySelector(`input[name="gad7-${i}"]:checked`);
        if (selected) {
            gad7Responses.push(parseInt(selected.value));
        }
    }
    
    // Validate that all questions are answered
    if (phq9Responses.length < 9 || gad7Responses.length < 7) {
        showToast('Please answer all questions before submitting.', 'warning');
        return;
    }
    
    // Analyze responses locally (client-side)
    const results = analyzeQuestionnaireResponses({
        phq9: phq9Responses,
        gad7: gad7Responses
    });
    
    // Display results
    displayQuestionnaireResults(results);
    
    // Navigate to results section
    showSection(questionnaireResultsSection);
    hideSection(questionnaireSection);
    currentStep = 'questionnaire-results';
    updateNavigationButtons();
}

// Analyze questionnaire responses (client-side implementation)
function analyzeQuestionnaireResponses(responses) {
    const result = {
        scores: {},
        severity: {},
        risk_level: 'low',
        conditions_detected: [],
        recommendations_priority: []
    };
    
    // PHQ-9 Analysis
    const phq9Score = responses.phq9.reduce((a, b) => a + b, 0);
    result.scores.depression = phq9Score;
    
    // PHQ-9 Severity
    if (phq9Score <= 4) {
        result.severity.depression = 'minimal';
    } else if (phq9Score <= 9) {
        result.severity.depression = 'mild';
    } else if (phq9Score <= 14) {
        result.severity.depression = 'moderate';
        result.conditions_detected.push('depression');
    } else if (phq9Score <= 19) {
        result.severity.depression = 'moderately_severe';
        result.conditions_detected.push('depression');
        result.risk_level = 'moderate';
    } else {
        result.severity.depression = 'severe';
        result.conditions_detected.push('depression');
        result.risk_level = 'high';
    }
    
    // GAD-7 Analysis
    const gad7Score = responses.gad7.reduce((a, b) => a + b, 0);
    result.scores.anxiety = gad7Score;
    
    // GAD-7 Severity
    if (gad7Score <= 4) {
        result.severity.anxiety = 'minimal';
    } else if (gad7Score <= 9) {
        result.severity.anxiety = 'mild';
    } else if (gad7Score <= 14) {
        result.severity.anxiety = 'moderate';
        result.conditions_detected.push('anxiety');
        if (result.risk_level === 'low') result.risk_level = 'moderate';
    } else {
        result.severity.anxiety = 'severe';
        result.conditions_detected.push('anxiety');
        result.risk_level = 'high';
    }
    
    // Check for suicidal ideation (Question 9 of PHQ-9)
    if (responses.phq9[8] > 0) {
        result.risk_level = 'high';
        result.recommendations_priority.push('immediate_professional_help');
        result.recommendations_priority.push('crisis_resources');
    }
    
    return result;
}

// Display questionnaire results
function displayQuestionnaireResults(results) {
    // Update PHQ-9 score display
    const phq9ScoreEl = document.getElementById('phq9-score');
    const phq9BarEl = document.getElementById('phq9-bar');
    const phq9SeverityEl = document.getElementById('phq9-severity');
    
    if (phq9ScoreEl) {
        phq9ScoreEl.textContent = results.scores.depression;
        phq9BarEl.style.width = `${(results.scores.depression / 27) * 100}%`;
        phq9SeverityEl.textContent = formatSeverity(results.severity.depression);
        phq9SeverityEl.className = `severity-label ${results.severity.depression}`;
    }
    
    // Update GAD-7 score display
    const gad7ScoreEl = document.getElementById('gad7-score');
    const gad7BarEl = document.getElementById('gad7-bar');
    const gad7SeverityEl = document.getElementById('gad7-severity');
    
    if (gad7ScoreEl) {
        gad7ScoreEl.textContent = results.scores.anxiety;
        gad7BarEl.style.width = `${(results.scores.anxiety / 21) * 100}%`;
        gad7SeverityEl.textContent = formatSeverity(results.severity.anxiety);
        gad7SeverityEl.className = `severity-label ${results.severity.anxiety}`;
    }
    
    // Update overall risk
    const overallRiskEl = document.getElementById('overall-risk');
    const assessmentSummaryEl = document.getElementById('assessment-summary');
    
    if (overallRiskEl) {
        overallRiskEl.textContent = `${results.risk_level.charAt(0).toUpperCase() + results.risk_level.slice(1)} Risk`;
        overallRiskEl.className = `assessment-level ${results.risk_level}`;
    }
    
    if (assessmentSummaryEl) {
        assessmentSummaryEl.textContent = generateAssessmentSummary(results);
    }
    
    // Update conditions detected
    const conditionsListEl = document.getElementById('conditions-list');
    if (conditionsListEl) {
        if (results.conditions_detected.length === 0) {
            conditionsListEl.innerHTML = `
                <div class="no-conditions">
                    <i class="fas fa-check-circle"></i>
                    <span>No significant concerns detected</span>
                </div>
            `;
        } else {
            conditionsListEl.innerHTML = results.conditions_detected.map(condition => `
                <div class="condition-badge ${condition}">
                    <i class="fas fa-${condition === 'depression' ? 'cloud-rain' : 'bolt'}"></i>
                    <span>${condition.charAt(0).toUpperCase() + condition.slice(1)}</span>
                </div>
            `).join('');
        }
    }
}

// Format severity label
function formatSeverity(severity) {
    const labels = {
        'minimal': 'Minimal',
        'mild': 'Mild',
        'moderate': 'Moderate',
        'moderately_severe': 'Moderately Severe',
        'severe': 'Severe'
    };
    return labels[severity] || severity;
}

// Generate assessment summary
function generateAssessmentSummary(results) {
    let summary = '';
    
    if (results.risk_level === 'high') {
        summary = 'Your responses indicate significant mental health concerns. We strongly recommend speaking with a mental health professional as soon as possible. ';
        if (results.recommendations_priority.includes('crisis_resources')) {
            summary += 'If you are having thoughts of self-harm, please reach out to a crisis helpline immediately.';
        }
    } else if (results.risk_level === 'moderate') {
        summary = 'Your responses suggest some areas that may benefit from attention. Consider speaking with a counselor or therapist to discuss these concerns. Practicing self-care strategies may also help.';
    } else {
        summary = 'Your responses indicate generally positive mental well-being. Continue maintaining healthy habits and monitor how you feel. Remember that seeking support is always okay, even when things are going well.';
    }
    
    return summary;
}

// =====================================================
// TEXT ANALYSIS FUNCTIONALITY
// =====================================================

// Start text analysis
function startTextAnalysis() {
    showSection(textAnalysisSection);
    hideSection(landingSection);
    currentStep = 'text-analysis';
    updateNavigationButtons();
}

// Update text statistics
function updateTextStats() {
    const text = feelingsText.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    if (wordCountDisplay) wordCountDisplay.textContent = `${words} words`;
    if (charCountDisplay) charCountDisplay.textContent = `${chars} characters`;
}

// Analyze text input
function analyzeText() {
    const text = feelingsText.value.trim();
    
    if (!text) {
        showToast('Please enter some text to analyze.', 'warning');
        return;
    }
    
    if (text.split(/\s+/).length < 5) {
        showToast('Please write at least a few sentences for a meaningful analysis.', 'warning');
        return;
    }
    
    // Analyze text locally (client-side NLP)
    const results = analyzeTextLocally(text);
    
    // Display results
    displayTextResults(results);
    
    // Navigate to results section
    showSection(textResultsSection);
    hideSection(textAnalysisSection);
    currentStep = 'text-results';
    updateNavigationButtons();
}

// Client-side text analysis (NLP-lite)
function analyzeTextLocally(text) {
    const processedText = text.toLowerCase();
    const words = processedText.split(/\s+/);
    
    // Sentiment analysis
    const sentiment = calculateSentiment(processedText, words);
    
    // Detect mental health indicators
    const indicators = detectIndicators(processedText);
    
    // Calculate risk level
    const riskLevel = calculateRiskLevel(indicators, sentiment);
    
    // Generate insights
    const insights = generateInsights(indicators, sentiment, riskLevel);
    
    return {
        sentiment,
        indicators,
        risk_level: riskLevel,
        insights,
        word_count: words.length
    };
}

// Calculate sentiment
function calculateSentiment(text, words) {
    const positiveWords = [
        'happy', 'joy', 'love', 'excited', 'grateful', 'thankful', 'blessed',
        'wonderful', 'amazing', 'great', 'good', 'nice', 'beautiful', 'hopeful',
        'optimistic', 'content', 'peaceful', 'calm', 'relaxed', 'confident'
    ];
    
    const negativeWords = [
        'sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'frustrated',
        'hopeless', 'worthless', 'tired', 'exhausted', 'lonely', 'scared', 'afraid',
        'terrible', 'awful', 'horrible', 'hate', 'pain', 'suffering', 'empty'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    // Use word boundary matching for accurate detection
    words.forEach(word => {
        // Clean the word of punctuation
        const cleanWord = word.replace(/[.,!?;:'"()]/g, '').toLowerCase();
        if (positiveWords.includes(cleanWord)) positiveCount++;
        if (negativeWords.includes(cleanWord)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    const polarity = total > 0 ? (positiveCount - negativeCount) / total : 0;
    const subjectivity = Math.min(1, (total / words.length) * 3);
    
    let interpretation = 'neutral';
    if (polarity > 0.2) interpretation = 'positive';
    else if (polarity < -0.2) interpretation = 'negative';
    
    return {
        polarity: Math.round(polarity * 100) / 100,
        subjectivity: Math.round(subjectivity * 100) / 100,
        positive_words: positiveCount,
        negative_words: negativeCount,
        interpretation
    };
}

// Detect mental health indicators
function detectIndicators(text) {
    const indicators = {
        depression: { level: 'none', keywords_found: [] },
        anxiety: { level: 'none', keywords_found: [] },
        stress: { level: 'none', keywords_found: [] }
    };
    
    // Depression keywords
    const depressionKeywords = {
        high: ['suicidal', 'suicide', 'kill myself', 'want to die', 'end my life', 'worthless', 'hopeless'],
        moderate: ['depressed', 'depression', 'empty', 'numb', 'no energy', 'hate myself', 'failure'],
        mild: ['sad', 'down', 'unhappy', 'low', 'unmotivated', 'lonely', 'tired']
    };
    
    // Anxiety keywords
    const anxietyKeywords = {
        high: ['panic attack', 'cannot breathe', 'terrified', 'heart racing', 'losing control'],
        moderate: ['anxious', 'anxiety', 'worried constantly', 'scared', 'restless', 'on edge'],
        mild: ['worried', 'nervous', 'uneasy', 'stressed', 'overwhelmed']
    };
    
    // Stress keywords
    const stressKeywords = {
        high: ['breaking down', 'cannot cope', 'falling apart', 'burned out'],
        moderate: ['stressed', 'pressure', 'too much', 'overworked', 'exhausted'],
        mild: ['busy', 'hectic', 'demanding', 'challenging']
    };
    
    // Helper function for word boundary matching
    function findKeywordMatch(text, keyword) {
        // For multi-word phrases, match directly
        if (keyword.includes(' ')) {
            return text.includes(keyword);
        }
        // For single words, use word boundary regex
        const regex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        return regex.test(text);
    }
    
    // Check each category
    checkKeywordsWithBoundary(text, depressionKeywords, indicators.depression, findKeywordMatch);
    checkKeywordsWithBoundary(text, anxietyKeywords, indicators.anxiety, findKeywordMatch);
    checkKeywordsWithBoundary(text, stressKeywords, indicators.stress, findKeywordMatch);
    
    return indicators;
}

// Helper function to check keywords with word boundary matching
function checkKeywordsWithBoundary(text, keywordSets, indicator, matchFn) {
    const levelPriority = { none: 0, mild: 1, moderate: 2, high: 3 };
    for (const [level, keywords] of Object.entries(keywordSets)) {
        for (const keyword of keywords) {
            if (matchFn(text, keyword)) {
                indicator.keywords_found.push(keyword);
                if (levelPriority[level] > levelPriority[indicator.level]) {
                    indicator.level = level;
                }
            }
        }
    }
}

// Calculate risk level from indicators and sentiment
function calculateRiskLevel(indicators, sentiment) {
    // High risk indicators
    if (indicators.depression.level === 'high' || indicators.anxiety.level === 'high') {
        return 'high';
    }
    
    // Moderate risk
    let moderateCount = 0;
    ['depression', 'anxiety', 'stress'].forEach(condition => {
        if (indicators[condition].level === 'moderate') moderateCount++;
    });
    
    if (moderateCount >= 2 || (moderateCount === 1 && sentiment.polarity < -0.3)) {
        return 'moderate';
    }
    
    // Mild indicators with negative sentiment
    let mildCount = 0;
    ['depression', 'anxiety', 'stress'].forEach(condition => {
        if (indicators[condition].level === 'mild') mildCount++;
    });
    
    if (mildCount >= 2 && sentiment.polarity < 0) {
        return 'moderate';
    }
    
    return 'low';
}

// Generate insights from analysis
function generateInsights(indicators, sentiment, riskLevel) {
    const insights = [];
    
    // Sentiment insight
    if (sentiment.interpretation === 'positive') {
        insights.push({
            type: 'positive',
            message: 'Your text expresses generally positive emotions and outlook.'
        });
    } else if (sentiment.interpretation === 'negative') {
        insights.push({
            type: 'concern',
            message: 'Your text reflects some negative emotions. This is normal to experience sometimes.'
        });
    }
    
    // Depression indicators
    if (indicators.depression.level !== 'none') {
        if (indicators.depression.level === 'high') {
            insights.push({
                type: 'urgent',
                message: 'We detected some concerning expressions in your text. Please consider speaking with a mental health professional.'
            });
        } else if (indicators.depression.level === 'moderate') {
            insights.push({
                type: 'concern',
                message: 'Your text suggests you may be experiencing some feelings of sadness or low mood.'
            });
        }
    }
    
    // Anxiety indicators
    if (indicators.anxiety.level !== 'none' && ['high', 'moderate'].includes(indicators.anxiety.level)) {
        insights.push({
            type: 'concern',
            message: 'Your text indicates you may be experiencing anxiety or worry. Relaxation techniques may help.'
        });
    }
    
    // Stress indicators
    if (indicators.stress.level !== 'none' && ['high', 'moderate'].includes(indicators.stress.level)) {
        insights.push({
            type: 'concern',
            message: 'You seem to be experiencing stress. Consider taking breaks and practicing self-care.'
        });
    }
    
    if (insights.length === 0) {
        insights.push({
            type: 'neutral',
            message: 'Your text appears emotionally balanced. Continue monitoring how you feel.'
        });
    }
    
    return insights;
}

// Display text analysis results
function displayTextResults(results) {
    // Update polarity bar
    const polarityBar = document.getElementById('polarity-bar');
    const polarityValue = document.getElementById('polarity-value');
    
    if (polarityBar && polarityValue) {
        const polarityPercent = ((results.sentiment.polarity + 1) / 2) * 100;
        polarityBar.style.width = `${polarityPercent}%`;
        polarityValue.textContent = results.sentiment.polarity.toFixed(2);
        
        // Set color based on polarity
        polarityBar.classList.remove('positive', 'negative');
        if (results.sentiment.polarity > 0) {
            polarityBar.classList.add('positive');
        } else if (results.sentiment.polarity < 0) {
            polarityBar.classList.add('negative');
        }
    }
    
    // Update subjectivity bar
    const subjectivityBar = document.getElementById('subjectivity-bar');
    const subjectivityValue = document.getElementById('subjectivity-value');
    
    if (subjectivityBar && subjectivityValue) {
        subjectivityBar.style.width = `${results.sentiment.subjectivity * 100}%`;
        subjectivityValue.textContent = results.sentiment.subjectivity.toFixed(2);
    }
    
    // Update sentiment interpretation
    const sentimentInterpretation = document.getElementById('sentiment-interpretation');
    if (sentimentInterpretation) {
        const interpretationText = {
            positive: 'Your overall sentiment is positive, indicating generally optimistic or happy feelings.',
            negative: 'Your overall sentiment is negative, which may indicate some emotional challenges.',
            neutral: 'Your overall sentiment is neutral, showing balanced emotional expression.'
        };
        sentimentInterpretation.textContent = interpretationText[results.sentiment.interpretation];
    }
    
    // Update indicators grid
    const indicatorsGrid = document.getElementById('indicators-grid');
    if (indicatorsGrid) {
        indicatorsGrid.innerHTML = ['depression', 'anxiety', 'stress'].map(condition => `
            <div class="indicator-card level-${results.indicators[condition].level}">
                <p class="indicator-name">${condition}</p>
                <p class="indicator-level level-${results.indicators[condition].level}">
                    ${results.indicators[condition].level === 'none' ? 'Not Detected' : results.indicators[condition].level}
                </p>
            </div>
        `).join('');
    }
    
    // Update insights list
    const insightsList = document.getElementById('insights-list');
    if (insightsList) {
        insightsList.innerHTML = results.insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <i class="fas fa-${getInsightIcon(insight.type)}"></i>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }
    
    // Update risk level
    const textRiskLevel = document.getElementById('text-risk-level');
    if (textRiskLevel) {
        textRiskLevel.textContent = results.risk_level.charAt(0).toUpperCase() + results.risk_level.slice(1);
        textRiskLevel.className = `risk-level ${results.risk_level}`;
    }
}

// Get icon for insight type
function getInsightIcon(type) {
    const icons = {
        positive: 'smile',
        concern: 'exclamation-triangle',
        urgent: 'exclamation-circle',
        neutral: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Generate intervention from questionnaire results
function generateInterventionFromQuestionnaire() {
    // Get the results from the displayed data
    const phq9Score = parseInt(document.getElementById('phq9-score')?.textContent || '0');
    const gad7Score = parseInt(document.getElementById('gad7-score')?.textContent || '0');
    
    // Determine dominant concern
    let dominantEmotion = 'neutral';
    if (phq9Score > gad7Score && phq9Score >= 10) {
        dominantEmotion = 'sad';
    } else if (gad7Score >= 10) {
        dominantEmotion = 'fearful';
    } else if (phq9Score >= 5 || gad7Score >= 5) {
        dominantEmotion = 'neutral';
    }
    
    // Use existing intervention generation
    updateEmotionSummary(dominantEmotion);
    generateRecommendations(dominantEmotion);
    generateExercises(dominantEmotion);
}

// Generate intervention from text analysis results
function generateInterventionFromText() {
    // Get the risk level from text results
    const riskLevel = document.getElementById('text-risk-level')?.textContent.toLowerCase() || 'low';
    const sentiment = document.getElementById('sentiment-interpretation')?.textContent || '';
    
    // Determine emotion based on analysis
    let dominantEmotion = 'neutral';
    if (sentiment.includes('negative')) {
        if (riskLevel === 'high') {
            dominantEmotion = 'sad';
        } else {
            dominantEmotion = 'fearful';
        }
    } else if (sentiment.includes('positive')) {
        dominantEmotion = 'happy';
    }
    
    // Use existing intervention generation
    updateEmotionSummary(dominantEmotion);
    generateRecommendations(dominantEmotion);
    generateExercises(dominantEmotion);
}

// =====================================================
// CHATBOT FUNCTIONALITY
// =====================================================

// Start chatbot
function startChatbot() {
    // Check if user data exists
    if (userData) {
        // Show account selection options (continue with existing or create new)
        showSection(chatbotRegistrationSection);
        hideSection(landingSection);
        currentStep = 'chatbot-registration';
        
        // Show existing account notice
        if (existingAccountNotice) {
            existingAccountNotice.classList.remove('hidden');
            if (existingUserNameSpan) {
                existingUserNameSpan.textContent = userData.name;
            }
        }
        
        // Hide the form initially
        if (userRegistrationForm) {
            userRegistrationForm.style.display = 'none';
        }
    } else {
        // Show registration first
        showSection(chatbotRegistrationSection);
        hideSection(landingSection);
        currentStep = 'chatbot-registration';
        
        // Hide existing account notice
        if (existingAccountNotice) {
            existingAccountNotice.classList.add('hidden');
        }
        
        // Show the form
        if (userRegistrationForm) {
            userRegistrationForm.style.display = 'block';
        }
    }
    updateNavigationButtons();
}

// Handle user registration
function handleUserRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const age = document.getElementById('user-age').value;
    
    if (!name) {
        showToast('Please enter your name', 'warning');
        return;
    }
    
    // Save user data
    userData = {
        name: name,
        email: email || null,
        age: age || null,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Navigate to chatbot
    showSection(chatbotSection);
    hideSection(chatbotRegistrationSection);
    currentStep = 'chatbot';
    updateNavigationButtons();
    
    // Initialize chatbot with welcome message
    initializeChatbot();
    
    showToast(`Welcome, ${escapeHtml(name)}! Let's chat.`, 'success');
}

// Continue with existing account
function continueWithExistingAccount() {
    // Navigate to chatbot with existing user data
    showSection(chatbotSection);
    hideSection(chatbotRegistrationSection);
    currentStep = 'chatbot';
    updateNavigationButtons();
    
    // Initialize chatbot with existing data
    initializeChatbot();
    
    showToast(`Welcome back, ${escapeHtml(userData.name)}!`, 'success');
}

// Create new account (clears existing account data)
async function createNewAccount() {
    // Confirm action with user using accessible modal
    const confirmed = await showConfirmationModal(
        'Create New Account',
        'Creating a new account will clear your existing account data and chat history. Are you sure you want to continue?'
    );
    
    if (confirmed) {
        // Clear existing user data
        userData = null;
        chatHistory = [];
        chatAnalysis = {
            messageCount: 0,
            detectedEmotions: [],
            topics: [],
            overallSentiment: 'neutral',
            riskLevel: 'low'
        };
        
        // Clear localStorage
        localStorage.removeItem('userData');
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('chatAnalysis');
        
        // Hide existing account notice and show form
        if (existingAccountNotice) {
            existingAccountNotice.classList.add('hidden');
        }
        if (userRegistrationForm) {
            userRegistrationForm.style.display = 'block';
            userRegistrationForm.reset();
        }
        
        showToast('Please enter your details to create a new account', 'info');
    }
}

// Handle logout
async function handleLogout() {
    // Confirm logout with user using accessible modal
    const confirmed = await showConfirmationModal(
        'Logout',
        'Are you sure you want to logout? Your data is saved locally and will be available when you login again.'
    );
    
    if (confirmed) {
        // Navigate back to landing
        showSection(landingSection);
        hideSection(chatbotSection);
        hideSection(reportSection);
        currentStep = 'landing';
        updateNavigationButtons();
        
        showToast('Logged out successfully', 'success');
    }
}

// Initialize chatbot
function initializeChatbot() {
    // Update user info display
    if (userNameDisplay && userData) {
        userNameDisplay.innerHTML = `<i class="fas fa-user-circle"></i> ${escapeHtml(userData.name)}`;
    }
    
    // Display existing chat history if any
    displayChatHistory();
    
    // If no chat history, show welcome message
    if (chatHistory.length === 0) {
        const userName = userData ? escapeHtml(userData.name) : '';
        const welcomeMessage = userData 
            ? `Hello ${userName}! 👋 I'm your MindfulAI assistant. I'm here to listen and provide support for your mental well-being.\n\nFeel free to share how you're feeling today, or ask me about:\n• Managing stress and anxiety\n• Coping strategies\n• Relaxation techniques\n• General mental health tips\n\nHow can I help you today?`
            : `Hello! 👋 I'm your MindfulAI assistant. I'm here to listen and provide support for your mental well-being.\n\nHow are you feeling today?`;
        
        addBotMessage(welcomeMessage);
    }
}

// Load user data from localStorage
function loadUserData() {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
    }
}

// Load chat history from localStorage
function loadChatHistory() {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
        chatHistory = JSON.parse(savedChatHistory);
    }
    
    const savedAnalysis = localStorage.getItem('chatAnalysis');
    if (savedAnalysis) {
        chatAnalysis = JSON.parse(savedAnalysis);
    }
}

// Save chat history to localStorage
function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    localStorage.setItem('chatAnalysis', JSON.stringify(chatAnalysis));
}

// Display chat history
function displayChatHistory() {
    if (!chatMessagesContainer) return;
    
    chatMessagesContainer.innerHTML = '';
    
    chatHistory.forEach(message => {
        const messageDiv = createMessageElement(message);
        chatMessagesContainer.appendChild(messageDiv);
    });
    
    scrollToBottom();
}

// Create message element
function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `chat-message ${message.role}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <div class="message-content">${formatMessageContent(message.content)}</div>
        <span class="message-time">${time}</span>
    `;
    
    return div;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format message content (convert newlines to HTML)
function formatMessageContent(content) {
    // First escape HTML to prevent XSS, then convert formatting
    return escapeHtml(content)
        .replace(/\n/g, '<br>')
        .replace(/•/g, '&bull;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Convert **bold** to <strong>
}

// Scroll chat to bottom
function scrollToBottom() {
    if (chatMessagesContainer) {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
}

// Send chat message
function sendChatMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addUserMessage(message);
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Generate response after a short delay (simulates typing)
    const typingDelay = TYPING_DELAY_MIN + Math.random() * (TYPING_DELAY_MAX - TYPING_DELAY_MIN);
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateChatbotResponse(message);
        addBotMessage(response);
    }, typingDelay);
}

// Add user message
function addUserMessage(content) {
    const message = {
        role: 'user',
        content: content,
        timestamp: new Date().toISOString()
    };
    
    chatHistory.push(message);
    chatAnalysis.messageCount++;
    
    // Analyze user message for emotions/topics
    analyzeUserMessage(content);
    
    // Display message
    const messageDiv = createMessageElement(message);
    chatMessagesContainer.appendChild(messageDiv);
    
    // Save to localStorage
    saveChatHistory();
    
    scrollToBottom();
}

// Add bot message
function addBotMessage(content) {
    const message = {
        role: 'bot',
        content: content,
        timestamp: new Date().toISOString()
    };
    
    chatHistory.push(message);
    
    // Display message
    const messageDiv = createMessageElement(message);
    chatMessagesContainer.appendChild(messageDiv);
    
    // Save to localStorage
    saveChatHistory();
    
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatMessagesContainer.appendChild(indicator);
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Analyze user message for emotions and topics
function analyzeUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Detect emotions
    const emotionKeywords = {
        happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good'],
        sad: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'crying'],
        anxious: ['anxious', 'worried', 'nervous', 'scared', 'panic', 'fear'],
        stressed: ['stressed', 'overwhelmed', 'pressure', 'exhausted', 'tired'],
        angry: ['angry', 'frustrated', 'annoyed', 'mad', 'irritated'],
        lonely: ['lonely', 'alone', 'isolated', 'nobody', 'no one']
    };
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword)) {
                if (!chatAnalysis.detectedEmotions.includes(emotion)) {
                    chatAnalysis.detectedEmotions.push(emotion);
                }
            }
        }
    }
    
    // Detect topics
    const topicKeywords = {
        work: ['work', 'job', 'boss', 'colleague', 'career', 'office'],
        relationships: ['relationship', 'partner', 'friend', 'family', 'marriage'],
        health: ['health', 'sleep', 'eating', 'exercise', 'body'],
        self_esteem: ['confident', 'worth', 'value', 'myself', 'self-esteem'],
        future: ['future', 'goals', 'plans', 'worry about']
    };
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword)) {
                if (!chatAnalysis.topics.includes(topic)) {
                    chatAnalysis.topics.push(topic);
                }
            }
        }
    }
    
    // Update risk level based on concerning keywords
    const highRiskKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'harm myself'];
    const moderateRiskKeywords = ['hopeless', 'worthless', 'no point', 'give up'];
    
    for (const keyword of highRiskKeywords) {
        if (lowerMessage.includes(keyword)) {
            chatAnalysis.riskLevel = 'high';
            break;
        }
    }
    
    if (chatAnalysis.riskLevel !== 'high') {
        for (const keyword of moderateRiskKeywords) {
            if (lowerMessage.includes(keyword)) {
                chatAnalysis.riskLevel = 'moderate';
                break;
            }
        }
    }
    
    // Update overall sentiment
    const positiveWords = ['happy', 'good', 'great', 'better', 'wonderful', 'love', 'excited'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
        if (lowerMessage.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
        if (lowerMessage.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
        chatAnalysis.overallSentiment = 'positive';
    } else if (negativeCount > positiveCount) {
        chatAnalysis.overallSentiment = 'negative';
    }
}

// Generate chatbot response
function generateChatbotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for high-risk messages first
    const highRiskKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'harm myself'];
    for (const keyword of highRiskKeywords) {
        if (lowerMessage.includes(keyword)) {
            return `I'm really concerned about what you've shared. Your life matters, and there are people who want to help. 💙\n\n🆘 Please reach out immediately:\n• National Suicide Prevention Lifeline: 988 or 1-800-273-8255\n• Crisis Text Line: Text HOME to 741741\n• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/\n\nYou don't have to face this alone. Would you like to talk more about what's been happening?`;
        }
    }
    
    // Check for greetings
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon'];
    for (const greeting of greetings) {
        if (lowerMessage.includes(greeting)) {
            return `Hello! ${userData ? userData.name + ', ' : ''}I'm glad you're here. How are you feeling today? Feel free to share what's on your mind.`;
        }
    }
    
    // Check for gratitude/goodbye
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return `You're welcome! 😊 Remember, taking time to check in with yourself is an important step in maintaining mental wellness. Is there anything else I can help you with?`;
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        return `Take care of yourself! Remember, you can always come back when you need someone to talk to. 💙 Stay well!`;
    }
    
    // Check for specific emotions/topics
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
        return `I hear that you're experiencing anxiety. That can be really uncomfortable. 💭\n\nHere are some techniques that might help:\n\n• **Deep Breathing**: Try the 4-7-8 technique - breathe in for 4 seconds, hold for 7, exhale for 8\n• **Grounding**: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste\n• **Progressive Muscle Relaxation**: Tense and release each muscle group\n\nWould you like me to guide you through any of these exercises?`;
    }
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
        return `I'm sorry to hear you're feeling down. Your feelings are valid, and it takes courage to acknowledge them. 💙\n\nSome things that might help:\n\n• **Small steps**: Even a short walk or listening to music you love can help\n• **Connect**: Reach out to someone you trust, even just to say hi\n• **Self-compassion**: Treat yourself with the kindness you'd show a friend\n• **Professional support**: Consider speaking with a counselor if these feelings persist\n\nWould you like to tell me more about what's been making you feel this way?`;
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
        return `Stress can feel really overwhelming. Let's work through this together. 🌟\n\n**Immediate relief:**\n• Take 3 slow, deep breaths right now\n• Step away from what's stressing you for 5 minutes\n• Splash some cool water on your face\n\n**Longer-term strategies:**\n• Break big tasks into smaller, manageable steps\n• Prioritize and let go of what's not essential\n• Make time for activities you enjoy\n• Consider setting boundaries\n\nWhat's the main source of your stress right now?`;
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('can\'t sleep')) {
        return `Sleep problems can really affect how we feel. Here are some evidence-based tips:\n\n**Sleep Hygiene:**\n• Keep a consistent sleep schedule, even on weekends\n• Avoid screens 1 hour before bed\n• Keep your bedroom cool and dark\n• Limit caffeine after noon\n\n**Relaxation:**\n• Try a body scan meditation before bed\n• Progressive muscle relaxation\n• Calming music or white noise\n\nHow long have you been having trouble sleeping?`;
    }
    
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('isolated')) {
        return `Feeling lonely can be really painful, and it's more common than you might think. 💙\n\n**Ways to connect:**\n• Reach out to an old friend or family member\n• Join a community group or class\n• Volunteer for a cause you care about\n• Consider online communities around your interests\n\n**Self-connection:**\n• Spend time doing activities you enjoy\n• Practice self-compassion\n• Remember that being alone and feeling lonely are different\n\nWould you like to talk about what's contributing to these feelings?`;
    }
    
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
        return `Anger is a natural emotion, and it's okay to feel frustrated. 🌿\n\n**Immediate techniques:**\n• Take a pause before reacting\n• Count to 10 slowly\n• Deep breathing\n• Physical activity like a brisk walk\n\n**Processing anger:**\n• Identify what triggered the feeling\n• Express your feelings constructively\n• Consider the other perspective\n• Write about it\n\nWhat's been making you feel this way?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        return `I'm here to support your mental well-being! Here's how I can help:\n\n🗣️ **Talk**: Share your feelings and concerns\n💡 **Suggestions**: Get coping strategies and tips\n😊 **Techniques**: Learn relaxation and mindfulness exercises\n📊 **Track**: I analyze our conversations to provide personalized insights\n📄 **Reports**: Generate a summary of your mental health journey\n\nWhat would you like to focus on today?`;
    }
    
    // Default empathetic response
    const responses = [
        `Thank you for sharing that with me. I'm here to listen. Can you tell me more about how that makes you feel?`,
        `I appreciate you opening up. It takes courage to talk about these things. What else is on your mind?`,
        `I hear you. Your feelings are valid. Would you like to explore some coping strategies together?`,
        `It sounds like you're going through a lot. Remember, it's okay to take things one step at a time. What would help you most right now?`,
        `Thank you for trusting me with this. How have you been coping with these feelings so far?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Clear chat history
function clearChat() {
    if (confirm('Are you sure you want to clear your chat history? This cannot be undone.')) {
        chatHistory = [];
        chatAnalysis = {
            messageCount: 0,
            detectedEmotions: [],
            topics: [],
            overallSentiment: 'neutral',
            riskLevel: 'low'
        };
        
        localStorage.removeItem('chatHistory');
        localStorage.removeItem('chatAnalysis');
        
        chatMessagesContainer.innerHTML = '';
        initializeChatbot();
        
        showToast('Chat history cleared', 'success');
    }
}

// Generate report
function generateReport() {
    if (chatHistory.length < 2) {
        showToast('Please have a conversation first to generate a report.', 'warning');
        return;
    }
    
    const reportContent = document.getElementById('report-content');
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const userMessageCount = chatHistory.filter(m => m.role === 'user').length;
    
    // Generate recommendations based on analysis
    const recommendations = generateReportRecommendations();
    
    // Escape user data for safe HTML insertion
    const safeName = userData ? escapeHtml(userData.name) : 'Anonymous';
    const safeEmail = userData && userData.email ? escapeHtml(userData.email) : '';
    const safeAge = userData && userData.age ? escapeHtml(String(userData.age)) : '';
    
    reportContent.innerHTML = `
        <div class="report-header">
            <h3>Mental Health Assessment Report</h3>
            <p class="report-date">${reportDate}</p>
        </div>
        
        <div class="report-section">
            <h4><i class="fas fa-user"></i> User Information</h4>
            <div class="report-item">
                <span class="label">Name:</span>
                <span class="value">${safeName}</span>
            </div>
            ${safeEmail ? `
            <div class="report-item">
                <span class="label">Email:</span>
                <span class="value">${safeEmail}</span>
            </div>
            ` : ''}
            ${safeAge ? `
            <div class="report-item">
                <span class="label">Age:</span>
                <span class="value">${safeAge}</span>
            </div>
            ` : ''}
            <div class="report-item">
                <span class="label">Session Date:</span>
                <span class="value">${reportDate}</span>
            </div>
        </div>
        
        <div class="report-section">
            <h4><i class="fas fa-chart-line"></i> Conversation Analysis</h4>
            <div class="report-item">
                <span class="label">Total Messages:</span>
                <span class="value">${userMessageCount}</span>
            </div>
            <div class="report-item">
                <span class="label">Overall Sentiment:</span>
                <span class="value" style="color: ${getSentimentColor(chatAnalysis.overallSentiment)}; text-transform: capitalize;">
                    ${escapeHtml(chatAnalysis.overallSentiment)}
                </span>
            </div>
            <div class="report-item">
                <span class="label">Risk Assessment:</span>
                <span class="value" style="color: ${getRiskColor(chatAnalysis.riskLevel)}; text-transform: capitalize;">
                    ${escapeHtml(chatAnalysis.riskLevel)}
                </span>
            </div>
        </div>
        
        ${chatAnalysis.detectedEmotions.length > 0 ? `
        <div class="report-section">
            <h4><i class="fas fa-heart"></i> Detected Emotions</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${chatAnalysis.detectedEmotions.map(emotion => `
                    <span class="condition-badge" style="background: rgba(94, 114, 228, 0.15); color: #5e72e4; text-transform: capitalize;">
                        ${emotion}
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${chatAnalysis.topics.length > 0 ? `
        <div class="report-section">
            <h4><i class="fas fa-tags"></i> Topics Discussed</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${chatAnalysis.topics.map(topic => `
                    <span class="condition-badge" style="background: rgba(45, 206, 137, 0.15); color: #2dce89; text-transform: capitalize;">
                        ${topic.replace('_', ' ')}
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="report-section">
            <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
            <ul class="report-recommendations">
                ${recommendations.map(rec => `
                    <li><i class="fas fa-check-circle"></i> ${rec}</li>
                `).join('')}
            </ul>
        </div>
        
        <div class="report-summary">
            <p><strong>Summary:</strong> ${generateReportSummary()}</p>
        </div>
        
        <div class="report-section" style="margin-top: 1.5rem; background: rgba(245, 54, 92, 0.1); border-left: 4px solid var(--danger-color);">
            <h4 style="color: var(--danger-color);"><i class="fas fa-exclamation-triangle"></i> Important Disclaimer</h4>
            <p style="font-size: 0.9rem;">This report is generated by an AI chatbot and is not a professional medical diagnosis. If you are experiencing mental health difficulties, please consult with a qualified mental health professional.</p>
        </div>
    `;
    
    showSection(reportSection);
    hideSection(chatbotSection);
    currentStep = 'report';
    updateNavigationButtons();
}

// Generate recommendations based on chat analysis
function generateReportRecommendations() {
    const recommendations = [];
    
    if (chatAnalysis.detectedEmotions.includes('anxious')) {
        recommendations.push('Practice daily relaxation techniques such as deep breathing or meditation');
        recommendations.push('Consider limiting caffeine intake and establishing a calming bedtime routine');
    }
    
    if (chatAnalysis.detectedEmotions.includes('sad') || chatAnalysis.detectedEmotions.includes('depressed')) {
        recommendations.push('Engage in activities that bring you joy, even small ones');
        recommendations.push('Maintain social connections and reach out to supportive friends or family');
        recommendations.push('Consider speaking with a mental health professional');
    }
    
    if (chatAnalysis.detectedEmotions.includes('stressed')) {
        recommendations.push('Prioritize tasks and break large projects into smaller, manageable steps');
        recommendations.push('Schedule regular breaks and time for self-care activities');
    }
    
    if (chatAnalysis.detectedEmotions.includes('lonely')) {
        recommendations.push('Join community groups or activities aligned with your interests');
        recommendations.push('Consider volunteering as a way to connect with others');
    }
    
    if (chatAnalysis.topics.includes('sleep') || chatAnalysis.topics.includes('health')) {
        recommendations.push('Maintain a consistent sleep schedule and practice good sleep hygiene');
        recommendations.push('Regular physical activity can significantly improve mental well-being');
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
        recommendations.push('Continue practicing self-awareness and emotional check-ins');
        recommendations.push('Maintain healthy lifestyle habits including regular exercise and balanced nutrition');
        recommendations.push('Build and nurture supportive relationships');
    }
    
    if (chatAnalysis.riskLevel === 'moderate' || chatAnalysis.riskLevel === 'high') {
        recommendations.unshift('Consider scheduling an appointment with a mental health professional for support');
    }
    
    return recommendations;
}

// Generate report summary
function generateReportSummary() {
    if (chatAnalysis.riskLevel === 'high') {
        return 'Based on our conversation, there are some significant concerns that would benefit from professional support. Please consider reaching out to a mental health professional or crisis helpline.';
    } else if (chatAnalysis.riskLevel === 'moderate') {
        return 'Our conversation indicates some areas that may benefit from additional support. The recommendations above may help, and speaking with a counselor could provide further guidance.';
    } else if (chatAnalysis.overallSentiment === 'negative') {
        return 'While some challenges were discussed, there are effective strategies that can help. Consider implementing the recommendations above and continuing to monitor your well-being.';
    } else {
        return 'Thank you for taking the time to check in with your mental health. Continue to practice self-care and maintain awareness of your emotional well-being.';
    }
}

// Get sentiment color
function getSentimentColor(sentiment) {
    switch (sentiment) {
        case 'positive': return 'var(--success-color)';
        case 'negative': return 'var(--warning-color)';
        default: return 'var(--secondary-color)';
    }
}

// Get risk color
function getRiskColor(risk) {
    switch (risk) {
        case 'low': return 'var(--success-color)';
        case 'moderate': return 'var(--warning-color)';
        case 'high': return 'var(--danger-color)';
        default: return 'var(--secondary-color)';
    }
}

// Download report as text file
function downloadReport() {
    const reportContent = document.getElementById('report-content');
    if (!reportContent) return;
    
    const reportDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    let textContent = `MENTAL HEALTH ASSESSMENT REPORT
================================
Generated: ${reportDate}

USER INFORMATION
----------------
Name: ${userData ? userData.name : 'Anonymous'}
${userData && userData.email ? `Email: ${userData.email}` : ''}
${userData && userData.age ? `Age: ${userData.age}` : ''}

CONVERSATION ANALYSIS
--------------------
Total Messages: ${chatHistory.filter(m => m.role === 'user').length}
Overall Sentiment: ${chatAnalysis.overallSentiment}
Risk Assessment: ${chatAnalysis.riskLevel}

${chatAnalysis.detectedEmotions.length > 0 ? `DETECTED EMOTIONS
-----------------
${chatAnalysis.detectedEmotions.join(', ')}
` : ''}

${chatAnalysis.topics.length > 0 ? `TOPICS DISCUSSED
----------------
${chatAnalysis.topics.map(t => t.replace('_', ' ')).join(', ')}
` : ''}

RECOMMENDATIONS
---------------
${generateReportRecommendations().map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

SUMMARY
-------
${generateReportSummary()}

DISCLAIMER
----------
This report is generated by an AI chatbot and is not a professional medical diagnosis. 
If you are experiencing mental health difficulties, please consult with a qualified mental health professional.

Emergency Resources:
- National Suicide Prevention Lifeline: 988 or 1-800-273-8255
- Crisis Text Line: Text HOME to 741741
`;

    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mental-health-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Report downloaded successfully!', 'success');
}

// Back to chat from report
function backToChat() {
    showSection(chatbotSection);
    hideSection(reportSection);
    currentStep = 'chatbot';
    updateNavigationButtons();
}
