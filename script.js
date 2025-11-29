// Global variables
let currentStep = 'landing';
let detectedEmotions = [];
let faceDetectionInterval;
let emotionHistory = [];
const HISTORY_MAX_LENGTH = 5;

// API Base URL (for backend integration)
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const landingSection = document.getElementById('landing-section');
const detectionSection = document.getElementById('detection-section');
const interventionSection = document.getElementById('intervention-section');
const historySection = document.getElementById('history-section');
const questionnaireSection = document.getElementById('questionnaire-section');
const textAnalysisSection = document.getElementById('text-analysis-section');
const textResultsSection = document.getElementById('text-results-section');
const questionnaireResultsSection = document.getElementById('questionnaire-results-section');

const startCheckBtn = document.getElementById('start-check-btn');
const startQuestionnaireBtn = document.getElementById('start-questionnaire-btn');
const startTextBtn = document.getElementById('start-text-btn');
const submitQuestionnaireBtn = document.getElementById('submit-questionnaire-btn');
const analyzeTextBtn = document.getElementById('analyze-text-btn');
const backBtn = document.getElementById('back-btn');
const continueBtn = document.getElementById('continue-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeShutter = document.getElementById('theme-shutter');

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
    submitQuestionnaireBtn.addEventListener('click', submitQuestionnaire);
    analyzeTextBtn.addEventListener('click', analyzeText);
    backBtn.addEventListener('click', navigateBack);
    continueBtn.addEventListener('click', navigateForward);

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

    // Create dynamic shooting stars for dark mode
    createShootingStars(10);
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

        // Load face-api models
        await loadModels();

        // Access webcam
        await startWebcam();

        // Start face detection
        startFaceDetection();
    } catch (error) {
        console.error('Error starting detection:', error);
        showToast('An error occurred while starting the detection process. Please ensure that you have granted camera permissions and try again.', 'error');
    }
}

// Load face-api.js models
async function loadModels() {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
            faceapi.nets.faceExpressionNet.loadFromUri('./models')
        ]);
        loadingIndicator.classList.add('hidden');
        return true;
    } catch (error) {
        console.error('Error loading models:', error);
        throw new Error('Failed to load AI models');
    }
}

// Start webcam access
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });
        webcamElement.srcObject = stream;

        return new Promise((resolve) => {
            webcamElement.onloadedmetadata = () => {
                // Ensure video element has correct display size for overlay calculations
                resolve(true);
            };
        });
    } catch (error) {
        console.error('Error accessing webcam:', error);
        throw new Error('Failed to access webcam. Please ensure camera permissions are granted.');
    }
}

// Start face detection
function startFaceDetection() {
    const canvas = overlayCanvas;

    faceDetectionInterval = setInterval(async () => {
        // Use actual video dimensions
        const displayWidth = webcamElement.videoWidth || 640;
        const displayHeight = webcamElement.videoHeight || 480;

        // Ensure canvas matches video size
        canvas.width = displayWidth;
        canvas.height = displayHeight;

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
