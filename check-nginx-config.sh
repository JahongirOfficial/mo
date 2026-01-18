#!/bin/bash

echo "🔍 Проверка конфигурации Nginx на сервере 164.68.109.208"
echo "=========================================================="
echo ""

# Проверка текущей конфигурации
echo "📋 Текущая конфигурация Nginx:"
echo "-------------------------------"
if [ -f "/etc/nginx/sites-available/mo" ]; then
    cat /etc/nginx/sites-available/mo
else
    echo "❌ Файл /etc/nginx/sites-available/mo не найден!"
fi

echo ""
echo "=========================================================="
echo ""

# Проверка симлинка
echo "🔗 Проверка симлинка:"
echo "---------------------"
if [ -L "/etc/nginx/sites-enabled/mo" ]; then
    echo "✅ Симлинк существует:"
    ls -la /etc/nginx/sites-enabled/mo
else
    echo "❌ Симлинк /etc/nginx/sites-enabled/mo не найден!"
fi

echo ""
echo "=========================================================="
echo ""

# Проверка синтаксиса nginx
echo "✅ Проверка синтаксиса Nginx:"
echo "-----------------------------"
nginx -t

echo ""
echo "=========================================================="
echo ""

# Проверка статуса nginx
echo "📊 Статус Nginx:"
echo "----------------"
systemctl status nginx --no-pager | head -10

echo ""
echo "=========================================================="
echo ""

# Проверка через curl
echo "🌐 Проверка через curl:"
echo "-----------------------"

echo "1. Проверка index.html (не должен кешироваться):"
curl -I http://164.68.109.208/index.html 2>/dev/null | grep -E "HTTP|Cache-Control"

echo ""
echo "2. Проверка несуществующего asset (должен быть 404):"
curl -I http://164.68.109.208/assets/nonexistent-file-test.js 2>/dev/null | grep "HTTP"

echo ""
echo "3. Проверка существующего asset:"
FIRST_JS=$(ls /var/www/mo/dist/assets/*.js 2>/dev/null | head -1 | xargs basename)
if [ -n "$FIRST_JS" ]; then
    echo "   Файл: $FIRST_JS"
    curl -I http://164.68.109.208/assets/$FIRST_JS 2>/dev/null | grep -E "HTTP|Cache-Control|Content-Type"
else
    echo "   ❌ JS файлы не найдены в /var/www/mo/dist/assets/"
fi

echo ""
echo "=========================================================="
echo ""

# Проверка файлов в dist
echo "📁 Файлы в /var/www/mo/dist/assets:"
echo "------------------------------------"
if [ -d "/var/www/mo/dist/assets" ]; then
    ls -lh /var/www/mo/dist/assets/*.js 2>/dev/null | head -5
    echo "..."
    echo "Всего JS файлов: $(ls /var/www/mo/dist/assets/*.js 2>/dev/null | wc -l)"
else
    echo "❌ Папка /var/www/mo/dist/assets не найдена!"
fi

echo ""
echo "=========================================================="
echo ""

# Проверка index.html
echo "📄 Проверка index.html:"
echo "-----------------------"
if [ -f "/var/www/mo/dist/index.html" ]; then
    echo "✅ Файл существует"
    echo "Размер: $(ls -lh /var/www/mo/dist/index.html | awk '{print $5}')"
    echo "Дата изменения: $(stat -c %y /var/www/mo/dist/index.html)"
    echo ""
    echo "Первые упоминания /assets/ в index.html:"
    grep -o '/assets/[^"]*' /var/www/mo/dist/index.html | head -3
else
    echo "❌ Файл /var/www/mo/dist/index.html не найден!"
fi

echo ""
echo "=========================================================="
echo "✅ Проверка завершена!"
echo "=========================================================="
