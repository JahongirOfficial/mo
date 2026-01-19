#!/bin/bash

echo "🔧 Fixing setTimeout(0) issue on server..."

cd /var/www/moo

# Fix server/index.ts
echo "📝 Fixing server/index.ts..."
sed -i 's/req\.setTimeout(0);/req.setTimeout(1800000);/g' server/index.ts
sed -i 's/res\.setTimeout(0);/res.setTimeout(1800000);/g' server/index.ts
sed -i 's/server\.setTimeout(0);/server.setTimeout(1800000);/g' server/index.ts

# Fix server/routes/upload.ts
echo "📝 Fixing server/routes/upload.ts..."
sed -i 's/req\.setTimeout(0);/req.setTimeout(1800000);/g' server/routes/upload.ts
sed -i 's/res\.setTimeout(0);/res.setTimeout(1800000);/g' server/routes/upload.ts

echo "✅ Files fixed!"
echo ""
echo "🔨 Building..."
npm run build

echo ""
echo "🔄 Restarting PM2..."
pm2 restart moo

echo ""
echo "✅ Done! Check logs:"
pm2 logs moo --lines 20
