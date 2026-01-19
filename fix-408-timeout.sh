#!/bin/bash

echo "🔧 Fixing 408 Request Timeout for video uploads"
echo "================================================"
echo ""

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "⚠️  Nginx not installed - skipping nginx configuration"
    echo "   (This is OK if you're running locally)"
else
    echo "📝 Updating nginx configuration..."
    
    # Find nginx config file
    if [ -f "/etc/nginx/sites-available/moo" ]; then
        CONFIG_FILE="/etc/nginx/sites-available/moo"
    elif [ -f "/etc/nginx/sites-available/mo" ]; then
        CONFIG_FILE="/etc/nginx/sites-available/mo"
    else
        echo "⚠️  Nginx config file not found"
        CONFIG_FILE=""
    fi
    
    if [ -n "$CONFIG_FILE" ]; then
        # Backup original config
        sudo cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Check if timeout settings exist
        if grep -q "proxy_read_timeout" "$CONFIG_FILE"; then
            echo "✅ Timeout settings already exist in nginx config"
        else
            echo "➕ Adding timeout settings to nginx config..."
            
            # Add timeout settings after the location /api/ block
            sudo sed -i '/location \/api\/ {/a\        # Timeout settings for large uploads\n        proxy_read_timeout 1800s;\n        proxy_connect_timeout 1800s;\n        proxy_send_timeout 1800s;\n        client_body_timeout 1800s;' "$CONFIG_FILE"
        fi
        
        # Test nginx configuration
        echo ""
        echo "🧪 Testing nginx configuration..."
        if sudo nginx -t; then
            echo ""
            echo "✅ Nginx configuration is valid"
            echo "🔄 Restarting nginx..."
            sudo systemctl restart nginx
            echo "✅ Nginx restarted successfully"
        else
            echo ""
            echo "❌ Nginx configuration test failed"
            echo "   Restoring backup..."
            sudo cp "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)" "$CONFIG_FILE"
        fi
    fi
fi

echo ""
echo "🔄 Rebuilding and restarting Node.js server..."
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Restart with PM2 if available
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting with PM2..."
    pm2 restart mo 2>/dev/null || pm2 restart moo 2>/dev/null || pm2 restart all
    echo "✅ PM2 restarted"
else
    echo "⚠️  PM2 not found - please restart your server manually"
fi

echo ""
echo "✅ Done! The 408 timeout issue should be fixed."
echo ""
echo "📝 Changes made:"
echo "   1. Express server timeout increased to 30 minutes"
echo "   2. Upload route timeout increased to 30 minutes"
if [ -n "$CONFIG_FILE" ]; then
    echo "   3. Nginx timeouts increased to 30 minutes"
fi
echo ""
echo "🧪 Test by uploading a large video file (>100MB)"
