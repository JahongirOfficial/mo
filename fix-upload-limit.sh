#!/bin/bash

# Fix 413 Upload Error - Update nginx configuration
echo "🔧 Исправление ошибки 413 (Payload Too Large)..."

# Backup current nginx config
sudo cp /etc/nginx/sites-available/moo /etc/nginx/sites-available/moo.backup.$(date +%Y%m%d_%H%M%S)

# Update nginx config with increased limits
sudo tee /etc/nginx/sites-available/moo > /dev/null <<'EOF'
server {
    listen 80;
    server_name mukammalotaona.uz www.mukammalotaona.uz;

    # Global upload size limit
    client_max_body_size 500M;

    root /var/www/moo/dist;
    index index.html;

    # CRITICAL: index.html must NEVER be cached
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }

    # Assets folder - serve directly, NEVER fallback to index.html
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Static files in root
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|xml)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Service worker - no cache
    location = /sw.js {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
        add_header Pragma "no-cache";
        try_files $uri =404;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/moo/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy with increased limits
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Upload size limits
        client_max_body_size 500M;
        proxy_request_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Payments endpoint
    location /payments {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # React Router SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF

# Test nginx configuration
echo "🧪 Проверка конфигурации nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Конфигурация корректна"
    
    # Reload nginx
    echo "🔄 Перезагрузка nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Nginx успешно перезагружен"
    echo ""
    echo "📝 Изменения:"
    echo "   - client_max_body_size увеличен до 500M"
    echo "   - Добавлены таймауты для больших файлов"
    echo "   - Отключен proxy_request_buffering"
    echo ""
    echo "🎉 Ошибка 413 должна быть исправлена!"
else
    echo "❌ Ошибка в конфигурации nginx"
    echo "Восстановление из backup..."
    sudo cp /etc/nginx/sites-available/moo.backup.* /etc/nginx/sites-available/moo
    exit 1
fi
