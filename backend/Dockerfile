FROM php:8.3-cli-alpine AS base

RUN apk add --no-cache \
    bash \
    curl \
    oniguruma-dev \
    libxml2-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    xml \
    gd \
    bcmath \
    exif \
    pcntl \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["bash", "start.sh"]
