const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

let auctions = [];

app.post('/auctions', (req, res) => {
  const auction = { ...req.body, id: auctions.length + 1, status: 'pending' };
  auctions.push(auction);
  res.status(201).json(auction);
});

app.get('/auctions', (req, res) => {
  res.json(auctions);
});

app.get('/auctions/:id', (req, res) => {
  const auction = auctions.find(a => a.id == req.params.id);
  auction ? res.json(auction) : res.status(404).send();
});

app.delete('/auctions/:id', (req, res) => {
  auctions = auctions.filter(a => a.id != req.params.id);
  res.status(204).send();
});

app.listen(3002, () => console.log('Auction Service on port 3002'));
