import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

function App() {
  const [token, setToken] = useState('');
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    const s = io('http://localhost:3003');
    setSocketInstance(s);
    return () => {
      s.disconnect();
    };
  }, []);

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showAuctionForm, setShowAuctionForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const statusTimeoutRef = React.useRef(null);

  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [auctionData, setAuctionData] = useState({ title: '', description: '', starting_price: 0 });
  const [auctionDuration, setAuctionDuration] = useState(60); // duration in minutes
  const showMessage = (msg) => {
    console.log("Status:", msg);
  const showMessage = (msg) => {
    console.log("Status:", msg);
    setStatusMessage(msg);
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    statusTimeoutRef.current = setTimeout(() => {
      setStatusMessage('');
      statusTimeoutRef.current = null;
    }, 4000);
  };
    try {
      await axios.post('/users/register', registerData);
      setRegisterData({ name: '', email: '', password: '' });
      showMessage('✅ Compte créé avec succès');
      setShowRegisterForm(false);
    } catch (err) {
      showMessage('❌ Erreur lors de la création du compte');
      console.error(err);
    }
  };

  const login = async () => {
    try {
      const res = await axios.post('/users/login', loginData);
      setToken(res.data.token);
      setLoginData({ email: '', password: '' });
      showMessage('✅ Connexion réussie');
      setShowLoginForm(false);
    } catch (err) {
      showMessage('❌ Erreur de connexion');
      console.error(err);
    }
  };

  const fetchAuctions = async () => {
    try {
      const res = await axios.get('/auctions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctions(res.data);
    } catch (err) {
      showMessage('❌ Erreur lors du chargement des enchères');
      console.error(err);
    }
  };
  const createAuction = async () => {
    try {
      await axios.post('/auctions', {
        ...auctionData,
        owner_id: 1,
        ends_at: new Date(Date.now() + auctionDuration * 60 * 1000).toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuctionData({ title: '', description: '', starting_price: 0 });
      setAuctionDuration(60);
      setShowAuctionForm(false);
      showMessage('✅ Enchère créée avec succès');
      fetchAuctions();
    } catch (err) {
      showMessage('❌ Erreur lors de la création de l\'enchère');
      console.error(err);
    }
  };

  const selectAuction = async (auction) => {
    setSelectedAuction(auction);
    try {
      const res = await axios.get(`/bids/auction/${auction.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBids(res.data);
    } catch (err) {
      setBids([]);
      showMessage('❌ Erreur lors du chargement des offres');
      console.error(err);
    }
  };

  useEffect(() => {
    if (!socketInstance || !selectedAuction) return;

    const bidUpdateHandler = (bid) => {
      setBids(prev => [...prev, bid]);
    };

    socketInstance.on(`bid_update_${selectedAuction.id}`, bidUpdateHandler);

    return () => {
      socketInstance.off(`bid_update_${selectedAuction.id}`, bidUpdateHandler);
    };
  }, [selectedAuction, socketInstance]);

  useEffect(() => {
    if (token) fetchAuctions();
  }, [token]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Auction Platform</h1>

      {statusMessage && (
        <div style={{ backgroundColor: '#e0ffe0', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
          {statusMessage}
        </div>
      )}

      {!token && (
        <>
          <button onClick={() => setShowLoginForm(true)}>Se connecter</button>
          <button onClick={() => setShowRegisterForm(true)}>Créer un compte</button>
        </>
      )}
      {token && (
        <>
          <button onClick={fetchAuctions}>🔄 Rafraîchir les enchères</button>
          <button onClick={() => setShowAuctionForm(true)}>➕ Créer une enchère</button>
        </>
      )}

      <hr />

      {showRegisterForm && (
        <form onSubmit={e => { e.preventDefault(); register(); }}>
          <h3>Créer un compte</h3>
          <input placeholder="Nom" value={registerData.name} onChange={e => setRegisterData({ ...registerData, name: e.target.value })} /><br />
          <input placeholder="Email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} /><br />
          <input type="password" placeholder="Mot de passe" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} /><br />
          <button type="submit">S'inscrire</button>
        </form>
      )}

      {showLoginForm && (
        <form onSubmit={e => { e.preventDefault(); login(); }}>
          <h3>Connexion</h3>
          <input placeholder="Email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} /><br />
          <input type="password" placeholder="Mot de passe" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} /><br />
          <button type="submit">Connexion</button>
        </form>
      )}

      {showAuctionForm && (
        <form onSubmit={e => { e.preventDefault(); createAuction(); }}>
          <h3>Nouvelle enchère</h3>
          <input placeholder="Titre" value={auctionData.title} onChange={e => setAuctionData({ ...auctionData, title: e.target.value })} /><br />
          <input placeholder="Description" value={auctionData.description} onChange={e => setAuctionData({ ...auctionData, description: e.target.value })} /><br />
          <input type="number" placeholder="Prix de départ" value={auctionData.starting_price} onChange={e => setAuctionData({ ...auctionData, starting_price: parseFloat(e.target.value) })} /><br />
          <input type="number" min="1" placeholder="Durée (minutes)" value={auctionDuration} onChange={e => setAuctionDuration(Number(e.target.value))} /><br />
          <button type="submit">Créer</button>
        </form>
      )}

      {/* List of auctions */}
      <div>
        <h2>Enchères</h2>
        {auctions.length === 0 && <p>Aucune enchère disponible.</p>}
        {auctions.map(a => (
          <div
            key={a.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
              background: selectedAuction && selectedAuction.id === a.id ? '#f0f8ff' : '#fff'
            }}
            onClick={() => selectAuction(a)}
          >
            <strong>{a.title}</strong> — Actuel : {a.current_price} &euro;
          </div>
        ))}
      </div>

      {selectedAuction && (
        <div>
          <h3>Détails : {selectedAuction.title}</h3>
          <p>{selectedAuction.description}</p>
          <ul>
            {bids.map(b => <li key={b.id}>💰 {b.amount}&euro;</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;