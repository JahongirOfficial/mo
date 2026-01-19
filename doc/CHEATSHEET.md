# 🚀 Шпаргалка - Быстрое исправление

## Сервер: 164.68.109.208

### 1️⃣ Проверить проблему
```bash
ssh root@164.68.109.208
cd /var/www/mo
bash check-nginx-config.sh
```

### 2️⃣ Исправить
```bash
bash fix-nginx-cache.sh
```

### 3️⃣ В браузере
`Ctrl + Shift + R` или режим инкогнито

---

## Быстрые команды

```bash
# Подключиться
ssh root@164.68.109.208

# Перейти в проект
cd /var/www/mo

# Проверить конфигурацию
cat /etc/nginx/sites-available/mo

# Проверить логи
sudo tail -f /var/log/nginx/error.log

# Перезапустить nginx
sudo systemctl reload nginx

# Проверить PM2
pm2 status
pm2 logs mo

# Проверить файлы
ls -la /var/www/mo/dist/assets/ | head

# Тест curl
curl -I http://164.68.109.208/index.html
curl -I http://164.68.109.208/assets/fake.js
```

---

## Что должно быть

✅ **index.html:**
```
Cache-Control: no-store, no-cache
```

✅ **Несуществующий /assets/fake.js:**
```
HTTP/1.1 404 Not Found
```

✅ **Существующий /assets/index-*.js:**
```
HTTP/1.1 200 OK
Cache-Control: public, immutable
Content-Type: application/javascript
```

---

## Файлы для исправления

- `nginx-fix.conf` - правильная конфигурация
- `fix-nginx-cache.sh` - скрипт исправления
- `check-nginx-config.sh` - скрипт проверки
- `deploy-164.sh` - обновленный deploy
