@echo off
title FreeLink - Killer
echo ====================================================
echo Stopping all Java and Node processes...
echo ====================================================

taskkill /F /IM java.exe /T
taskkill /F /IM node.exe /T

echo.
echo All processes terminated.
pause
