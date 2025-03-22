const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Путь к файлу users.json в той же папке
const usersFilePath = path.join(__dirname, 'users.json');

// Middleware для разбора JSON в теле запроса
app.use(bodyParser.json());
// Отдача статичных файлов из текущей папки
app.use(express.static(__dirname));

// Функция для чтения пользователей из файла
function readUsers() {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
}

// Функция для записи пользователей в файл
function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Эндпоинт для регистрации/авторизации
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  let users = readUsers();

  // Ищем пользователя с таким же логином
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    // Если пользователь найден и пароли совпадают – авторизуем его
    if (existingUser.password === password) {
      return res.json({ success: true, message: "Пользователь авторизован", user: existingUser });
    } else {
      return res.status(400).json({ success: false, message: "Пользователь с таким логином уже существует, пароль не совпадает!" });
    }
  }

  // Если пользователь не найден, создаём нового
  const newUser = {
    username,
    password,
    profile: {
      level: 1,
      xp: 0,
      skills: []
    }
  };
  users.push(newUser);
  writeUsers(users);

  return res.json({ success: true, message: "Регистрация успешна", user: newUser });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
