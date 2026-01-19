# Quick Deploy to Production with Cache Busting
Write-Host "🚀 Быстрый деплой на продакшен..." -ForegroundColor Cyan

$VPS_USER = "root"
$VPS_HOST = "mukammalotaona.uz"

Write-Host ""
Write-Host "📦 Сборка проекта локально..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка сборки" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📤 Загрузка на сервер..." -ForegroundColor Yellow
scp -r dist "${VPS_USER}@${VPS_HOST}:/var/www/moo/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка загрузки" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Перезапуск приложения..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_HOST}" "cd /var/www/moo && pm2 restart moo"

Write-Host ""
Write-Host "✅ Деплой завершен!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Что дальше:" -ForegroundColor Cyan
Write-Host "   1. Откройте сайт: https://mukammalotaona.uz" -ForegroundColor White
Write-Host "   2. Очистите кеш браузера (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "   3. Или откройте в режиме инкогнито" -ForegroundColor White
Write-Host "   4. Попробуйте загрузить видео снова" -ForegroundColor White
Write-Host ""
