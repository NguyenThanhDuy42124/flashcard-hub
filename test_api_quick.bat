@echo off
REM Quick API test for Windows - run this to verify the fix works
REM Usage: test_api_quick.bat [port]
REM Default port: 25297

setlocal enabledelayedexpansion

set PORT=%1
if "%PORT%"=="" set PORT=25297

set SERVER=http://localhost:%PORT%

echo Testing /api/decks endpoint...
echo Server: %SERVER%
echo.

REM Test the API
curl -s "%SERVER%/api/decks"

echo.
echo.
echo If you see JSON data above, the fix is working!
echo If you see an error or no response, check the server is running.

pause
