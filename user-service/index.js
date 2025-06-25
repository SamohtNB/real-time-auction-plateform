const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const USERS_FILE = './users.json';
const SECRET = 'jwt_secret_key';

// Utilitaire pour lire/écrire les utilisateurs
const readUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
};

const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const users = readUsers();

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email déjà utilisé' });
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, name, email, password_hash };
  users.push(user);
  writeUsers(users);

  res.status(201).json({ message: 'User registered' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET);
  res.json({ token });
});

app.listen(3001, () => console.log('User Service on port 3001'));
