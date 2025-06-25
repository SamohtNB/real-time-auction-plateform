const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server,
  {
    cors: {
      origin: "http://localhost:3006",
      methods: ["GET", "POST"]
    }
  }
);
app.use(bodyParser.json());

let bids = [];

io.on('connection', socket => {
  console.log('Client connected');
});

app.post('/bids', (req, res) => {
  const bid = { ...req.body, id: bids.length + 1, timestamp: new Date() };
  bids.push(bid);
  io.emit(`bid_update_${bid.auction_id}`, bid);
  res.status(201).json(bid);
});

app.get('/bids/auction/:auction_id', (req, res) => {
  const auctionBids = bids.filter(b => b.auction_id == req.params.auction_id);
  res.json(auctionBids);
});

app.get('/bids/user/:user_id', (req, res) => {
  const userBids = bids.filter(b => b.user_id == req.params.user_id);
  res.json(userBids);
});

server.listen(3003, () => console.log('Bid Service on port 3003'));
