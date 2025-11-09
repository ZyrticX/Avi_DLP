@echo off
REM YouTube Server Setup Script for Windows
echo Installing YouTube Downloader Server...

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo Python found!
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo Virtual environment created!
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install requirements
    pause
    exit /b 1
)

echo.
echo ====================================
echo Installation completed successfully!
echo ====================================
echo.
echo To start the server:
echo   1. Activate the virtual environment: venv\Scripts\activate
echo   2. Run: python server.py
echo.
echo Don't forget to install FFmpeg!
echo Download from: https://ffmpeg.org/download.html
echo.
pause




