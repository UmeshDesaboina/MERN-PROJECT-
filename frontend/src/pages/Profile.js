import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setUser(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await axios.put('http://localhost:5000/api/users/profile', { name, email }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setUser(res.data);
      alert('Profile updated');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage msg={error} />;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Profile</h1>
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
};

export default Profile;