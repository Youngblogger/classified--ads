#!/bin/bash
chmod -R 777 storage bootstrap/cache 2>/dev/null
php artisan migrate --force 2>&1
echo "--- Running seeders ---"
php artisan db:seed --class DatabaseSeeder --force 2>&1
echo "--- Starting server ---"
php artisan serve --host=0.0.0.0 --port=$PORT
