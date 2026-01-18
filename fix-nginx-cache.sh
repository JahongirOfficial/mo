#!/bin/bash

echo "🔧 Fixing Nginx configuration for Vite SPA..."

# 1. Copy new nginx config
echo "📋 Copying nginx configuration..."
sudo cp nginx-fix.conf /etc/nginx/sites-available/moo
sudo ln -sf /etc/nginx/sites-available/moo /etc/nginx/sites-enabled/moo

# 2. Test nginx config
echo "✅ Testing nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

# 3. Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

# 4. Clear nginx cache (if exists)
if [ -d "/var/cache/nginx" ]; then
    echo "🧹 Clearing nginx cache..."
    sudo rm -rf /var/cache/nginx/*
fi

echo ""
echo "✅ Done! Now you need to:"
echo "1. Clear browser cache (Ctrl+Shift+Delete)"
echo "2. Or do hard refresh (Ctrl+Shift+R)"
echo "3. Or open in incognito mode"
echo ""
echo "📝 What was fixed:"
echo "   ✓ index.html is now never cached"
echo "   ✓ /assets/* returns 404 (not index.html) for missing files"
echo "   ✓ /assets/* cached for 1 year (immutable)"
echo ""
