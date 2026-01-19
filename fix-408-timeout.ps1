# Fix 408 Request Timeout for video uploads (Windows/Local)

Write-Host "🔧 Fixing 408 Request Timeout for video uploads" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔄 Rebuilding and restarting Node.js server..." -ForegroundColor Yellow

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build TypeScript
Write-Host "🔨 Building TypeScript..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "✅ Done! The 408 timeout issue should be fixed." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Changes made:" -ForegroundColor Cyan
Write-Host "   1. Express server timeout increased to 30 minutes" -ForegroundColor White
Write-Host "   2. Upload route timeout increased to 30 minutes" -ForegroundColor White
Write-Host "   3. Frontend already has no timeout (timeout: 0)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Stop your current dev server (Ctrl+C)" -ForegroundColor White
Write-Host "   2. Run: npm run dev" -ForegroundColor Yellow
Write-Host "   3. Test by uploading a large video file (>100MB)" -ForegroundColor White
Write-Host ""
