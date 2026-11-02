@echo off
title MilanView Remote Desktop
:: Launches MilanView in dedicated native desktop window
set APP_URL=https://ais-dev-3kkvmlvkoktimq3tu5rut2-1001368005830.asia-southeast1.run.app

where msedge.exe >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "" msedge.exe --app=%APP_URL% --window-size=1280,840 --disable-features=TranslateUI
    exit /b
)

where chrome.exe >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "" chrome.exe --app=%APP_URL% --window-size=1280,840
    exit /b
)

start "" "%APP_URL%"
exit /b
