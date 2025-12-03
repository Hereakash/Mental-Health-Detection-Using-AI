#!/bin/bash

# Facial Detection Setup Verification Script
# This script checks if all required files are present and accessible

# Configuration
FACEAPI_FILE="assets/js/face-api.min.js"
FACEAPI_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/dist/face-api.min.js"
MIN_FILE_SIZE=600000  # Minimum expected file size in bytes (~600KB)

echo "=================================================="
echo "Facial Detection Setup Verification"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Face-API.js library
echo -n "Checking face-api.js library... "
if [ -f "$FACEAPI_FILE" ]; then
    # Cross-platform stat command
    # -f%z: macOS/BSD syntax for file size
    # -c%s: Linux/GNU syntax for file size
    SIZE=$(stat -f%z "$FACEAPI_FILE" 2>/dev/null || stat -c%s "$FACEAPI_FILE" 2>/dev/null)
    if [ "$SIZE" -gt "$MIN_FILE_SIZE" ]; then
        echo -e "${GREEN}✓ OK${NC} ($SIZE bytes)"
    else
        echo -e "${YELLOW}⚠ WARNING${NC} (File too small: $SIZE bytes, expected ~649KB)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗ MISSING${NC}"
    echo "  Download: curl -L -o $FACEAPI_FILE $FACEAPI_URL"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Models directory
echo -n "Checking models directory... "
if [ -d "models" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ MISSING${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Individual model files
MODEL_FILES=(
    "models/tiny_face_detector_model-weights_manifest.json"
    "models/tiny_face_detector_model-shard1"
    "models/face_landmark_68_model-weights_manifest.json"
    "models/face_landmark_68_model-shard1"
    "models/face_recognition_model-weights_manifest.json"
    "models/face_recognition_model-shard1"
    "models/face_recognition_model-shard2"
    "models/face_expression_model-weights_manifest.json"
    "models/face_expression_model-shard1"
)

echo "Checking model files:"
for file in "${MODEL_FILES[@]}"; do
    echo -n "  - $(basename "$file")... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ MISSING${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check 4: Index.html
echo -n "Checking index.html... "
if [ -f "index.html" ]; then
    if grep -q "assets/js/face-api.min.js" "index.html"; then
        echo -e "${GREEN}✓ OK${NC} (references local library)"
    else
        echo -e "${YELLOW}⚠ WARNING${NC} (might be using CDN only)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗ MISSING${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: Web server check
echo ""
echo "Checking if web server is running..."
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Server running${NC} on http://localhost:8080"
    
    # Test if face-api.js is accessible
    echo -n "  Testing face-api.js accessibility... "
    if curl -s -I http://localhost:8080/assets/js/face-api.min.js | grep -q "200 OK"; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ NOT ACCESSIBLE${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Test if models are accessible
    echo -n "  Testing models accessibility... "
    if curl -s -I http://localhost:8080/models/tiny_face_detector_model-weights_manifest.json | grep -q "200 OK"; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ NOT ACCESSIBLE${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "  ${YELLOW}⚠ No server detected${NC}"
    echo "  Start with: python -m http.server 8080"
    echo "  Then visit: http://localhost:8080"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "=================================================="
echo "Summary"
echo "=================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo "You can use facial detection feature."
    echo ""
    echo "To start:"
    echo "1. Run: python -m http.server 8080"
    echo "2. Visit: http://localhost:8080"
    echo "3. Click 'Start Detection' button"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo "Setup is functional but some optimizations recommended."
    echo "See TROUBLESHOOTING_FACIAL_DETECTION.md for details."
else
    echo -e "${RED}✗ $ERRORS error(s) and $WARNINGS warning(s) found${NC}"
    echo "Please fix the errors above before using facial detection."
    echo ""
    echo "For help, see:"
    echo "- README.md"
    echo "- TROUBLESHOOTING_FACIAL_DETECTION.md"
    exit 1
fi

exit 0
