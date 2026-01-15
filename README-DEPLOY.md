# Инструкция по деплою на сервер

## Настройка GitHub Actions

### 1. Настройка Secrets

Перейдите в репозиторий на GitHub:
- **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Добавьте следующие secrets (см. `.github/SECRETS.md` для подробностей):

- `SERVER_HOST` = `89.125.63.17`
- `SERVER_USER` = `root`
- `SERVER_PASSWORD` = `Q358m8ar9HWrU1uoVB`
- `SERVER_PORT` = `22` (опционально)
- `SERVER_PATH` = `/var/www/html` (опционально)

### 2. Первоначальная настройка сервера

#### Вариант 1: Через GitHub Actions (рекомендуется)

1. Перейдите в **Actions** в репозитории
2. Выберите workflow **Setup Server (One-time)**
3. Нажмите **Run workflow**
4. Дождитесь завершения

#### Вариант 2: Вручную через SSH

```bash
ssh root@89.125.63.17
# Пароль: Q358m8ar9HWrU1uoVB

# На сервере выполните:
apt-get update -y
apt-get install -y apache2 php php-cli php-common libapache2-mod-php
a2enmod rewrite
a2enmod headers
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
systemctl restart apache2
systemctl enable apache2
```

## Автоматический деплой

После настройки secrets деплой происходит автоматически при каждом push в ветку `main` или `master`.

### Ручной запуск деплоя

1. Перейдите в **Actions** в репозитории
2. Выберите workflow **Deploy to Server**
3. Нажмите **Run workflow**
4. Выберите ветку и нажмите **Run workflow**

### Локальная сборка (для тестирования)

```bash
# Сборка проекта
npm run build

# Копирование PHP файлов
cp public/install.php dist/install.php
cp public/.htaccess dist/.htaccess
```

## Проверка работы

После деплоя проверьте:

1. Главная страница: `http://89.125.63.17/`
2. Страница установки: `http://89.125.63.17/install.php`
3. Логи Apache: `tail -f /var/log/apache2/error.log`

## Настройка домена (опционально)

Если у вас есть домен:

1. Настройте DNS записи, указывающие на IP `89.125.63.17`
2. Создайте виртуальный хост в Apache:

```bash
# На сервере
nano /etc/apache2/sites-available/your-domain.conf
```

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

```bash
# Активация сайта
a2ensite your-domain.conf
systemctl reload apache2
```

## Безопасность

Рекомендуется:

1. Настроить SSH ключи вместо пароля
2. Изменить стандартный порт SSH
3. Настроить firewall (ufw)
4. Настроить SSL сертификат (Let's Encrypt)
