const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

let users = [];
const SECRET = 'jwt_secret_key';

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, name, email, password_hash };
  users.push(user);
  res.status(201).json({ message: 'User registered' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET);
  res.json({ token });
});

app.listen(3001, () => console.log('User Service on port 3001'));
