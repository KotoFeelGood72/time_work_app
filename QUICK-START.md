# Быстрый старт деплоя

## 1. Настройка GitHub Secrets

Перейдите в репозиторий на GitHub:
- **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Добавьте secrets (см. `.github/SECRETS.md`):
- `SERVER_HOST` = `89.125.63.17`
- `SERVER_USER` = `root`
- `SERVER_PASSWORD` = `Q358m8ar9HWrU1uoVB`

## 2. Первоначальная настройка сервера

### Через GitHub Actions (рекомендуется):

1. **Actions** → **Setup Server (One-time)** → **Run workflow**

### Или вручную через SSH:

```bash
ssh root@89.125.63.17
# Пароль: Q358m8ar9HWrU1uoVB

apt-get update -y
apt-get install -y apache2 php php-cli php-common libapache2-mod-php
a2enmod rewrite
a2enmod headers
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
systemctl restart apache2
systemctl enable apache2
```

## 3. Автоматический деплой

Деплой происходит автоматически при каждом push в `main` или `master`.

### Ручной запуск:
**Actions** → **Deploy to Server** → **Run workflow**

## 4. Проверка

После деплоя откройте:
- Главная: `http://89.125.63.17/`
- Установка: `http://89.125.63.17/install.php`

## Локальная сборка (для тестирования)

```bash
npm run build
# Файлы будут в папке dist/
```
