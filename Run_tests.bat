@echo off
echo Running all Playwright tests...
npx playwright test --reporter=html
echo.
echo Tests finished. Opening report...
npx playwright show-report
pause
