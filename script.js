// Global variables
let currentStep = 'landing';
let detectedEmotions = [];
let faceDetectionInterval;
let emotionHistory = [];
const HISTORY_MAX_LENGTH = 5;

// DOM Elements
const landingSection = document.getElementById('landing-section');
const detectionSection = document.getElementById('detection-section');
const interventionSection = document.getElementById('intervention-section');
const historySection = document.getElementById('history-section');

const startCheckBtn = document.getElementById('start-check-btn');
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Initialize the application
function initApp() {
    // Set up event listeners
    startCheckBtn.addEventListener('click', startDetection);
    backBtn.addEventListener('click', navigateBack);
    continueBtn.addEventListener('click', navigateForward);

    // Animated theme toggle
    themeToggleBtn.addEventListener('click', animatedThemeToggle);

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Load emotion history from localStorage
    loadEmotionHistory();
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
        alert('An error occurred while starting the detection process. Please ensure that you have granted camera permissions and try again.');
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
            continueBtn.textContent = 'View History';
            break;
        case 'history':
            backBtn.classList.remove('hidden');
            continueBtn.classList.remove('hidden');
            continueBtn.textContent = 'Start Over';
            break;
    }
}

// Create placeholder for face-api models directory
// This simulates the models directory that should contain face-api.js models
// In a real environment, these would be downloaded from face-api.js GitHub
