# Исправление проблемы с кешированием Vite SPA в Nginx

## 🔴 Проблема

```
Failed to load module script: Expected a JavaScript module script 
but the server responded with a MIME type of "text/html"

Uncaught TypeError: Failed to fetch dynamically imported module 
/assets/BolimTanlash-<hash>.js
```

## 🎯 Причина

1. **index.html закешировался** и ссылается на старые хэши файлов
2. **Nginx отдает index.html вместо 404** для несуществующих `/assets/*.js`
3. Браузер получает HTML вместо JS → ошибка MIME type

## ✅ Решение

### На продакшен сервере (Linux):

```bash
# 1. Перейти в папку проекта
cd /var/www/moo

# 2. Применить исправленную конфигурацию
bash fix-nginx-cache.sh

# 3. Очистить кеш браузера
# Ctrl+Shift+Delete или Ctrl+Shift+R
```

### Что исправлено в nginx-fix.conf:

#### ✅ index.html НИКОГДА не кешируется
```nginx
location = /index.html {
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    try_files $uri =404;
}
```

#### ✅ /assets/* возвращает 404 (НЕ index.html!)
```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;  # ← Ключевое изменение!
}
```

#### ✅ SPA fallback только для HTML маршрутов
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 🔍 Проверка

После применения исправлений:

```bash
# 1. Проверить, что index.html не кешируется
curl -I http://45.92.173.33/index.html
# Должно быть: Cache-Control: no-store, no-cache

# 2. Проверить, что несуществующий asset возвращает 404
curl -I http://45.92.173.33/assets/nonexistent.js
# Должно быть: 404 Not Found (НЕ 200 OK!)

# 3. Проверить, что существующий asset кешируется
curl -I http://45.92.173.33/assets/index-<hash>.js
# Должно быть: Cache-Control: public, immutable
```

## 📋 Чеклист деплоя

После каждого `npm run build`:

- [ ] Загрузить новый `dist/` на сервер
- [ ] Проверить, что nginx конфигурация актуальна
- [ ] Очистить кеш браузера (или открыть в инкогнито)
- [ ] Проверить в DevTools → Network, что все файлы загружаются

## 🚨 Важно

**НИКОГДА не кешируйте index.html в Vite проектах!**

Vite использует content-hash в именах файлов. Если index.html и assets из разных билдов → приложение сломается.

## 🔗 Полезные ссылки

- [Vite: Building for Production](https://vitejs.dev/guide/build.html)
- [Nginx: try_files directive](http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
- [SPA deployment best practices](https://router.vuejs.org/guide/essentials/history-mode.html#nginx)
