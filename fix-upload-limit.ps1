# Fix 413 Upload Error on VPS
Write-Host "🔧 Исправление ошибки 413 на сервере..." -ForegroundColor Cyan

# SSH connection details
$VPS_USER = "root"
$VPS_HOST = "mukammalotaona.uz"

Write-Host "📡 Подключение к серверу $VPS_HOST..." -ForegroundColor Yellow

# Upload fix script
Write-Host "📤 Загрузка скрипта на сервер..." -ForegroundColor Yellow
scp fix-upload-limit.sh "${VPS_USER}@${VPS_HOST}:/tmp/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка загрузки скрипта" -ForegroundColor Red
    exit 1
}

# Execute fix script on server
Write-Host "🚀 Выполнение исправлений на сервере..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_HOST}" "chmod +x /tmp/fix-upload-limit.sh && /tmp/fix-upload-limit.sh"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Исправление успешно применено!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Что было сделано:" -ForegroundColor Cyan
    Write-Host "   1. Увеличен client_max_body_size до 500M" -ForegroundColor White
    Write-Host "   2. Добавлены таймауты для больших файлов" -ForegroundColor White
    Write-Host "   3. Отключен proxy_request_buffering" -ForegroundColor White
    Write-Host "   4. Nginx перезагружен" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Теперь можно загружать видео до 500MB!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Ошибка при применении исправлений" -ForegroundColor Red
    Write-Host "Проверьте логи на сервере" -ForegroundColor Yellow
    exit 1
}
