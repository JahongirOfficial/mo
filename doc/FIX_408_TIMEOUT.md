# Fix 408 Request Timeout Error

## Problem
When uploading large video files (>100MB), you get a **408 Request Timeout** error. The upload progress shows but then fails with:
```
Failed to load resource: the server responded with a status of 408 ()
Upload error: AxiosError {message: 'Request failed with status code 408', ...}
```

## Root Cause
The default timeout for HTTP servers is typically 2 minutes (120 seconds). Large video uploads take longer than this, causing the server to timeout before the upload completes.

## Solution Applied

### 1. Express Server Timeout (✅ Fixed)
**File**: `server/index.ts`

Added global timeout middleware and server timeout:
```typescript
// Increase server timeout for large file uploads (30 minutes)
app.use((req, res, next) => {
  req.setTimeout(1800000); // 30 minutes
  res.setTimeout(1800000); // 30 minutes
  next();
});

// At the end of file
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});

// Set server timeout to 30 minutes for large uploads
server.setTimeout(1800000);
```

### 2. Upload Route Timeout (✅ Fixed)
**File**: `server/routes/upload.ts`

Added specific timeout for the upload endpoint:
```typescript
router.post('/video', isAdmin, (req, res, next) => {
  // Set longer timeout for video uploads (30 minutes)
  req.setTimeout(1800000);
  res.setTimeout(1800000);
  next();
}, upload.single('video'), async (req: AuthRequest, res) => {
  // ... upload logic
});
```

### 3. Frontend Axios (✅ Already OK)
**File**: `src/api/index.ts`

Already configured with no timeout:
```typescript
const uploadInstance = axios.create({
  baseURL: API_URL,
  timeout: 0, // No timeout
});
```

### 4. Nginx Configuration (⚠️ If using production server)
If you're running on a production server with nginx, you need to update nginx config:

**File**: `/etc/nginx/sites-available/moo` (or `/etc/nginx/sites-available/mo`)

Add these lines inside the `location /api/ {` block:
```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # Timeout settings for large uploads
    proxy_read_timeout 1800s;
    proxy_connect_timeout 1800s;
    proxy_send_timeout 1800s;
    client_body_timeout 1800s;
}
```

## How to Apply the Fix

### For Local Development (Windows):
```powershell
# Run the fix script
.\fix-408-timeout.ps1

# Then restart your dev server
npm run dev
```

### For Production Server (Linux):
```bash
# Run the fix script
chmod +x fix-408-timeout.sh
./fix-408-timeout.sh

# Or manually:
npm run build
pm2 restart moo
```

### Manual Steps:
1. **Stop your server** (Ctrl+C if running locally)
2. **Rebuild TypeScript**: `npm run build`
3. **Restart server**:
   - Local: `npm run dev`
   - Production: `pm2 restart moo`
4. **Test** by uploading a large video file

## Testing

1. Go to Admin Panel → Darslar
2. Click "Qo'shish" (Add new lesson)
3. Select "Video" type
4. Upload a large video file (>100MB)
5. Watch the progress bar - it should complete without timeout

## Expected Upload Times

| File Size | 1 MB/s | 5 MB/s | 10 MB/s |
|-----------|--------|--------|---------|
| 100 MB    | ~2 min | ~20 sec| ~10 sec |
| 300 MB    | ~5 min | ~1 min | ~30 sec |
| 500 MB    | ~8 min | ~2 min | ~50 sec |

With 30-minute timeout, you can upload files up to ~1.8GB at 1 MB/s.

## Troubleshooting

### Still getting 408 error?

1. **Check if changes are applied**:
   ```bash
   # Make sure TypeScript is rebuilt
   npm run build
   
   # Check if server restarted
   pm2 logs moo --lines 20
   ```

2. **Check nginx logs** (if using nginx):
   ```bash
   tail -f /var/log/nginx/error.log
   ```

3. **Verify timeout in code**:
   ```bash
   # Should show setTimeout(1800000)
   grep -n "setTimeout" server/index.ts
   ```

### Upload still slow?

- **Compress video before upload** using ffmpeg:
  ```bash
  ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast -movflags +faststart output.mp4
  ```

- **Check internet speed**:
  ```bash
  speedtest-cli
  ```

- **Consider chunked upload** for files >500MB (see `doc/CHUNKED_UPLOAD_GUIDE.md`)

## Related Files

- `server/index.ts` - Main server configuration
- `server/routes/upload.ts` - Upload route handler
- `src/api/index.ts` - Frontend API client
- `doc/UPLOAD_OPTIMIZATION.md` - Upload optimization guide
- `doc/CHUNKED_UPLOAD_GUIDE.md` - Chunked upload implementation

## Summary

The 408 timeout error is now fixed by:
1. ✅ Increasing Express server timeout to 30 minutes
2. ✅ Increasing upload route timeout to 30 minutes
3. ✅ Frontend already has no timeout
4. ⚠️ Nginx timeout needs manual update on production server

**Restart your server and test the upload!**
