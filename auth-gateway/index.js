const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET = 'jwt_secret_key';

// Autoriser CORS depuis React
app.use(cors());
app.use(express.json());

// Middleware JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).send('Token required');
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).send('Invalid token');
  }
};

// Redirections par microservice
app.use('/users', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true
}));

app.use('/auctions', authMiddleware, createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true
}));

app.use('/bids', authMiddleware, createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true
}));

app.listen(3000, () => console.log('API Gateway on port 3000'));
