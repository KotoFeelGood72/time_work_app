# CI/CD

## Обзор

CI/CD pipeline для автоматизации сборки, тестирования и деплоя приложения.

## Этапы

### 1. Установка зависимостей
```bash
npm ci
```

### 2. Проверка типов
```bash
npm run type-check
```

### 3. Линтинг
```bash
npm run lint
```

### 4. Сборка
```bash
npm run build
```

## GitHub Actions

### Workflow для Pull Request
- Проверка типов TypeScript
- Линтинг кода
- Сборка проекта

### Workflow для Main/Master
- Все проверки из PR workflow
- Деплой на production/staging

## Переменные окружения

- `NODE_VERSION` - версия Node.js (из package.json engines)
- `VITE_*` - переменные для Vite (если нужны)

## Деплой

Артефакты сборки находятся в директории `dist/`.

## Пример GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```
