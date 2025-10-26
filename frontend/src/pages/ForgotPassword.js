import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../Services/api';
import localLogo from '../assets/logo.svg';
const LOGO_URL = 'https://iili.io/KrEPWoF.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!email.trim()) { setMessage('Email is required'); return; }
    if (!password) { setMessage('New password is required'); return; }
    if (password !== confirm) { setMessage('Passwords do not match'); return; }
    try {
      setLoading(true);
      const res = await api.post('/auth/resetpassword-direct', { email, password, confirmPassword: confirm });
      setMessage(res.data.msg || 'Password updated successfully');
    } catch (err) {
      setMessage(err?.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0b0b0b',
        color: '#e5e7eb',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #333'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={LOGO_URL} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = localLogo; }} alt="Fight Wisdom logo" style={{ width: '96px', height: '96px', objectFit: 'contain', display: 'block', margin: '0 auto 20px', background: '#0b0b0b', padding: '8px', borderRadius: '12px' }} />
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '8px'
          }}>Reset Password</h2>
          <p style={{ color: '#cbd5e1', fontSize: '16px' }}>
            Enter your email and new password.
          </p>
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            background: '#3f1d1d',
            color: '#fecaca',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1px solid #333',
                background: '#111',
                color: '#e5e7eb',
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 16px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  background: '#111',
                  color: '#e5e7eb',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                required
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 8, top: 8, padding: '6px 8px', background: '#222', borderRadius: 6 }}>
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 16px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  background: '#111',
                  color: '#e5e7eb',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                required
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: 'absolute', right: 8, top: 8, padding: '6px 8px', background: '#222', borderRadius: 6 }}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '16px'
            }}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
            <span style={{ color: '#cbd5e1' }}>
              Remember your password? <Link to="/login" style={{ color: '#fff', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
