# Исправление ошибки 413 (Payload Too Large)

## Проблема
При загрузке видео на продакшен сервере возникает ошибка:
```
Failed to load resource: the server responded with a status of 413
```

Это означает, что размер загружаемого файла превышает лимит, установленный в nginx.

## Причины
1. **Nginx** - ограничение `client_max_body_size` (по умолчанию 1MB)
2. **Express** - ограничение body parser (по умолчанию 100kb)
3. **Multer** - ограничение размера файла

## Решение

### Автоматическое исправление (рекомендуется)

Запустите скрипт для автоматического исправления на сервере:

```powershell
.\fix-upload-limit.ps1
```

Или вручную на сервере:
```bash
chmod +x fix-upload-limit.sh
./fix-upload-limit.sh
```

### Ручное исправление

#### 1. Обновить nginx конфигурацию

Подключитесь к серверу:
```bash
ssh root@mukammalotaona.uz
```

Отредактируйте конфигурацию:
```bash
sudo nano /etc/nginx/sites-available/moo
```

Добавьте в блок `server`:
```nginx
server {
    # Global upload size limit
    client_max_body_size 500M;
    
    # ... остальная конфигурация
}
```

И в блок `location /api/`:
```nginx
location /api/ {
    # ... другие настройки
    
    # Upload size limits
    client_max_body_size 500M;
    proxy_request_buffering off;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
}
```

#### 2. Проверить и перезагрузить nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. Обновить Express сервер

Файл уже обновлен в `server/index.ts`:
```typescript
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
```

Перезапустите сервер:
```bash
pm2 restart moo
```

## Проверка

После применения исправлений:

1. Откройте админ панель
2. Попробуйте загрузить видео
3. Ошибка 413 должна исчезнуть

## Текущие лимиты

- **Nginx**: 500MB
- **Express body parser**: 500MB
- **Multer (video upload)**: 500MB

## Дополнительные настройки

Если нужно увеличить лимит еще больше, измените значения:

1. В `nginx-fix.conf`: `client_max_body_size 1G;`
2. В `server/index.ts`: `limit: '1gb'`
3. В `server/routes/upload.ts`: `fileSize: 1024 * 1024 * 1024`

## Troubleshooting

### Ошибка все еще возникает

1. Проверьте глобальную конфигурацию nginx:
```bash
sudo nano /etc/nginx/nginx.conf
```

Добавьте в блок `http`:
```nginx
http {
    client_max_body_size 500M;
    # ...
}
```

2. Проверьте логи nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

3. Проверьте логи приложения:
```bash
pm2 logs moo
```

### Загрузка зависает

Это нормально для больших файлов. Убедитесь, что:
- Таймауты установлены (300s)
- `proxy_request_buffering off` включен
- Интернет соединение стабильно

## Полезные команды

```bash
# Проверить текущую конфигурацию nginx
sudo nginx -T | grep client_max_body_size

# Проверить статус nginx
sudo systemctl status nginx

# Перезапустить nginx
sudo systemctl restart nginx

# Проверить логи
sudo tail -f /var/log/nginx/error.log
pm2 logs moo --lines 100
```
