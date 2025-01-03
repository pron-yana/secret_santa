# Проєкт Secret Santa

## Огляд проєкту

"Secret Santa" — це веб-застосунок на базі Node.js, створений для організації обміну подарунками в стилі "Таємного Санти". Користувачі можуть реєструватися, створювати святкування, запрошувати друзів та випадковим чином визначати, хто кому даруватиме подарунок. Проєкт демонструє основні навички веб-розробки з використанням Node.js, а також реалізацію базового CRUD-функціоналу.

Спробувати застосунок можна за посиланням (https://secret-santa-xiql.onrender.com/).

## Функціонал

### Управління користувачами

- **Реєстрація**: Користувачі можуть реєструватися, використовуючи логін і пароль (зберігаються у відкритому вигляді для спрощення).
- **Авторизація**: Користувачі можуть входити до системи для доступу до своїх святкувань та участі в інших.

### Святкування

- **Створення події**: Користувачі можуть створювати нове святкування та ділитися унікальним посиланням для запрошення друзів.
- **Приєднання до події**: Запрошені користувачі можуть приєднуватися до святкування через посилання.
- **Завершення події**: Лише автор святкування може його завершити. Після цього учасники бачать, кому вони дарують подарунок.

### Зберігання даних

- **JSON-файл**: Локальне збереження даних користувачів і святкувань для тестування.
- **MongoDB**: Опція для зберігання даних у базі даних для масштабованості.

### Веб-інтерфейс

- **Стилізація Bootstrap**: Простий, чистий і адаптивний дизайн за допомогою Bootstrap.
- **Сторінки**:
  - Логін
  - Реєстрація
  - Створення святкування
  - Головна (список святкувань)
  - Деталі святкування (завершені та незавершені)

## Технологічний стек

- **Node.js**: Логіка бекенду та обробка серверної частини.
- **Bootstrap**: Стилізація для інтерфейсу користувача.
- **MongoDB**: База даних для зберігання.

## Структура файлів

Структура проєкту під час збереження данихий у JSON

```
SecretSanta/
├── public/          # Статичні файли (HTML, CSS, JS)
├── src/             # Початковий код
│   ├── controllers/ # Обробники запитів
│   ├── routes/      # Логіка маршрутизації
│   ├── app.js       # Головний файл сервера
├── data/            # Локальне збереження даних у форматі JSON
│   ├── users.json
│   ├── events.json
│   ├── sessions.json
├── README.md        # Документація проєкту
```

Структура проєкту під час збереження данихий у Mongo DB

```
SecretSanta/
├── public/          # Статичні файли (HTML, CSS, JS)
├── e2e/             # е2е тестування сценаріїв
├── src/             # Початковий код
│   ├── controllers/ # Обробники запитів
│   ├── models/      # Моделі даних (робота з MongoDB)
│   ├── routes/      # Логіка маршрутизації
│   ├── app.js       # Головний файл сервера
├── README.md        # Документація проєкту
```

## Як запустити

### Передумови

1. Встановіть [Node.js](https://nodejs.org/) (остання стабільна версія).

### Кроки

1. Клонувати репозиторій:
   ```bash
   git clone https://github.com/pron-yana/secret_santa.git
   ```
2. Перейти до директорії проєкту:
   ```bash
   cd secret_santa
   ```
3. Встановити залежності:
   ```bash
   npm install
   ```
4. Запустити сервер:
   ```bash
   npm run dev
   ```
5. Відкрити застосунок за адресою `http://localhost:3000`.

## Змінні середовища

Створіть файл `.env` у кореневій директорії та додайте наступне:

## Приклад використання

1. **Реєстрація**: Створіть обліковий запис.
2. **Авторизація**: Увійдіть у свій обліковий запис.
3. **Створення події**: Додайте нове святкування та поділіться посиланням з друзями.
4. **Приєднання до події**: Друзі використовують посилання для участі в святкуванні.
5. **Завершення події**: Автор завершує святкування, після чого учасники бачать, кому вони даруватимуть подарунок.

## Майбутні вдосконалення

- **Сповіщення електронною поштою**: Повідомлення учасникам про їхніх адресатів.
- **Шифрування паролів**: Використання безпечного хешування (наприклад, bcrypt) для збереження паролів.
- **Адмін-панель**: Управління всіма користувачами та святкуваннями.

## Внесок у проєкт

Приймаються будь-які пропозиції! Дотримуйтесь таких кроків:

1. Форкніть репозиторій.
2. Створіть нову гілку для своєї функції:
   ```bash
   git checkout -b feature-name
   ```
3. Зробіть коміт зі змінами:
   ```bash
   git commit -m "add new feature"
   ```
4. Запуште свою гілку:
   ```bash
   git push origin feature-name
   ```
5. Створіть pull request.

---

Приємного кодування та подарунків! 🎁
