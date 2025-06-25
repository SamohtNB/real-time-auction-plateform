const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let auctions = [];

// Créer une enchère
app.post('/auctions', (req, res) => {
  const auction = {
    id: auctions.length + 1,
    ...req.body,
    status: 'pending',
    current_price: req.body.starting_price || 0
  };
  auctions.push(auction);
  res.status(201).json(auction);
});

// Lister toutes les enchères
app.get('/auctions', (req, res) => {
  res.json(auctions);
});

// Récupérer une enchère par ID
app.get('/auctions/:id', (req, res) => {
  const auction = auctions.find(a => a.id == req.params.id);
  if (!auction) return res.status(404).json({ message: 'Not found' });
  res.json(auction);
});

// Supprimer une enchère
app.delete('/auctions/:id', (req, res) => {
  auctions = auctions.filter(a => a.id != req.params.id);
  res.status(204).send();
});

app.listen(3002, () => console.log('Auction Service on port 3002'));
