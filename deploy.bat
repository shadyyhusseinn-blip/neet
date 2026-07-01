@echo off
echo ========================================
echo Building and Deploying to Firebase
echo ========================================
echo.

echo Step 1: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo Build successful!
echo.

echo Step 2: Deploying to Firebase Hosting...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo Deploy failed!
    pause
    exit /b 1
)
echo Deploy successful!
echo.

echo ========================================
echo Deployment Complete!
echo Website: https://photography-shady-program.web.app
echo ========================================
pause
