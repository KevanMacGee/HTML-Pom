@echo off

setlocal

:: Set timestamp for filenames with your specified format (MMDDYY_HHMM)
for /f %%a in ('powershell -NoProfile -Command "Get-Date -Format 'MMddyy_HHmm'"') do set timestamp=%%a

echo Running Repomix...
echo Output will be saved to indieping-summary_%timestamp%.txt
echo.

:: Run repomix without logging
npx repomix --output "indieping-summary_%timestamp%.txt" --ignore ".env,*.log"

:: Always pause at the end
echo.
echo Script complete.
pause
