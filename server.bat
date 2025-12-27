@echo off
SETLOCAL

:: Define server directories
SET SUPPLIER_DIR=C:\Users\bhosa\OneDrive\Documents\GitHub\Casa
SET MAIN_DIR=C:\Users\bhosa\OneDrive\Documents\GitHub\Casa\server

:: Menu
:MENU
cls
echo ===========================
echo Server Management
echo ===========================
echo 1. Start both servers
echo 2. Stop both servers
echo 3. Exit
echo ===========================
set /p choice=Choose an option (1-3): 

if "%choice%"=="1" goto START_SERVERS
if "%choice%"=="2" goto STOP_SERVERS
if "%choice%"=="3" exit

goto MENU

:: --------- Start Servers ---------
:START_SERVERS
echo Starting Supplier Server...
cd %SUPPLIER_DIR%
start cmd /k "npm run dev"
cd ..

echo Starting Main Server...
cd %MAIN_DIR%
start cmd /k "node index.js"
cd ..

echo Both servers started!
start chrome http://localhost:5173/
pause
goto MENU

:: --------- Stop Servers ---------
:STOP_SERVERS
echo Stopping servers...

:: Kill node processes (assuming these are Node.js servers)
taskkill /F /IM node.exe

echo All servers stopped!
pause
exit
goto MENU
