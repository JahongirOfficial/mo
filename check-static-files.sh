#!/bin/bash

echo "🔍 Проверка статических файлов на сервере"
echo "=========================================="
echo ""

# Проверка папки uploads
echo "📁 Проверка /var/www/moo/uploads/:"
echo "-----------------------------------"
if [ -d "/var/www/moo/uploads" ]; then
    echo "✅ Папка существует"
    echo ""
    echo "Содержимое:"
    ls -lh /var/www/moo/uploads/ | head -20
else
    echo "❌ Папка не найдена!"
fi

echo ""
echo "📁 Проверка /var/www/moo/uploads/logo/:"
echo "----------------------------------------"
if [ -d "/var/www/moo/uploads/logo" ]; then
    echo "✅ Папка существует"
    ls -lh /var/www/moo/uploads/logo/
else
    echo "❌ Папка не найдена!"
    echo "Создаем папку..."
    mkdir -p /var/www/moo/uploads/logo
    chown -R www-data:www-data /var/www/moo/uploads/logo
fi

echo ""
echo "📄 Проверка ai.jpg:"
echo "-------------------"
if [ -f "/var/www/moo/uploads/ai.jpg" ]; then
    echo "✅ Файл существует"
    ls -lh /var/www/moo/uploads/ai.jpg
else
    echo "❌ Файл не найден!"
fi

echo ""
echo "📄 Проверка gr.png:"
echo "-------------------"
if [ -f "/var/www/moo/uploads/logo/gr.png" ]; then
    echo "✅ Файл существует"
    ls -lh /var/www/moo/uploads/logo/gr.png
else
    echo "❌ Файл не найден!"
fi

echo ""
echo "🌐 Проверка nginx конфигурации:"
echo "--------------------------------"
sudo nginx -T 2>/dev/null | grep -A 5 "location /uploads"

echo ""
echo "🧪 Тест доступа к файлам:"
echo "-------------------------"
echo "Тест 1: ai.jpg"
curl -I https://mukammalotaona.uz/uploads/ai.jpg 2>/dev/null | head -5

echo ""
echo "Тест 2: gr.png"
curl -I https://mukammalotaona.uz/uploads/logo/gr.png 2>/dev/null | head -5

echo ""
echo "=========================================="
echo "✅ Проверка завершена"
