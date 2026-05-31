pkill nginx 2>/dev/null
chmod -R 777 storage bootstrap/cache 2>/dev/null
php artisan serve --host=0.0.0.0 --port=$PORT
