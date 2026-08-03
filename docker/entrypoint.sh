#!/bin/sh
set -eu

APP_PORT="${PORT:-10000}"
sed -i "s/Listen 80/Listen ${APP_PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:10000>/<VirtualHost *:${APP_PORT}>/" /etc/apache2/sites-available/000-default.conf

php artisan config:cache
php artisan migrate --force
php artisan storage:link >/dev/null 2>&1 || true

exec "$@"