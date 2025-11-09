#!/bin/bash
# YouTube Server Setup Script for Linux/Mac

echo "Installing YouTube Downloader Server..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo "Python found: $(python3 --version)"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    exit 1
fi

echo "Virtual environment created!"
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install requirements"
    exit 1
fi

echo ""
echo "===================================="
echo "Installation completed successfully!"
echo "===================================="
echo ""
echo "To start the server:"
echo "  1. Activate the virtual environment: source venv/bin/activate"
echo "  2. Run: python server.py"
echo ""
echo "Don't forget to install FFmpeg!"
echo "Linux: sudo apt-get install ffmpeg"
echo "Mac: brew install ffmpeg"
echo ""




