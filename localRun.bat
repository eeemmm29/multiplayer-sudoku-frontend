@echo off
SET CONTAINER_NAME=multiplayer-sudoku-frontend
SET IMAGE_NAME=multiplayer-sudoku-frontend
REM Copy dev environment variables to .env
copy .env.local .env
REM Stop any running containers with the name 'multiplayer-sudoku-frontend'
docker ps -q -f name=%CONTAINER_NAME% >nul 2>nul
IF NOT ERRORLEVEL 1 (
    echo Stopping the running '%CONTAINER_NAME%' container...
    docker stop %CONTAINER_NAME%
    docker rm %CONTAINER_NAME%
)

REM Remove any previous images with the name 'multiplayer-sudoku-frontend'
docker images -q %IMAGE_NAME% >nul 2>nul
IF NOT ERRORLEVEL 1 (
    echo Removing the previous '%IMAGE_NAME%' Docker image...
    docker rmi %IMAGE_NAME%
)

echo Building the Docker image...
docker build -t %IMAGE_NAME% .
IF ERRORLEVEL 1 (
    echo Docker build failed. Exiting.
    exit /b 1
)

echo Docker image built successfully.

echo Running the Docker container...
docker run --name %CONTAINER_NAME% -p 3000:3000 -d %IMAGE_NAME%
IF ERRORLEVEL 1 (
    echo Docker container run failed. Exiting.
    exit /b 1
)

echo Docker container is running.

echo Opening http://localhost:3000 in the browser...
start http://localhost:3000
