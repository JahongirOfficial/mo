# PowerShell script for fixing Nginx cache issues on Windows

Write-Host "🔧 Fixing Nginx configuration for Vite SPA..." -ForegroundColor Cyan

# For local development, just rebuild
Write-Host "📦 Rebuilding project..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 For production server, run on Linux:" -ForegroundColor Yellow
Write-Host "   bash fix-nginx-cache.sh" -ForegroundColor White
Write-Host ""
Write-Host "🌐 For local testing:" -ForegroundColor Yellow
Write-Host "   1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "   2. Or hard refresh (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "   3. Or open in incognito mode" -ForegroundColor White
Write-Host ""
