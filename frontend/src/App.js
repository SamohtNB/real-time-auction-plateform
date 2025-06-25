import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3003');

function App() {
  const [token, setToken] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const login = async () => {
    const res = await axios.post('http://localhost:3000/users/login', {
      email: 'demo@example.com',
      password: 'password'
    });
    setToken(res.data.token);
  };

  const fetchAuctions = async () => {
    const res = await axios.get('http://localhost:3000/auctions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAuctions(res.data);
  };

  const selectAuction = async (auction) => {
    setSelectedAuction(auction);
    const res = await axios.get(`http://localhost:3000/bids/auction/${auction.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBids(res.data);
    socket.on(`bid_update_${auction.id}`, bid => {
      setBids(prev => [...prev, bid]);
    });
  };

  useEffect(() => { login(); }, []);
  useEffect(() => { if (token) fetchAuctions(); }, [token]);

  return (
    <div>
      <h1>Live Auctions</h1>
      {auctions.map(a => (
        <div key={a.id} onClick={() => selectAuction(a)}>
          {a.title} - Current: {a.current_price}
        </div>
      ))}
      {selectedAuction && (
        <div>
          <h2>{selectedAuction.title}</h2>
          <ul>{bids.map(b => <li key={b.id}>{b.amount}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export default App;