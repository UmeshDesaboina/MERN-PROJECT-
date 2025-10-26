import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import api from '../Services/api';
import ErrorMessage from '../components/ErrorMessage';
import localLogo from '../assets/logo.svg';
const LOGO_URL = 'https://iili.io/KrEPWoF.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const history = useHistory();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setInfo('');
      setLoading(true);
      const res = await api.post('/auth/register', { name, email, password });
      if (isMounted.current) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        history.push('/');
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err?.response?.data?.msg || 'Registration failed');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
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
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={LOGO_URL} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = localLogo; }} alt="Fight Wisdom logo" style={{ width: '120px', height: '120px', objectFit: 'contain', display: 'block', margin: '0 auto 20px', background: '#0b0b0b', padding: '8px', borderRadius: '12px' }} />
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px'
          }}>Create your account</h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Join Fight Wisdom and start shopping</p>
        </div>
        
        {error && <ErrorMessage msg={error} />}
        {info && (
          <div style={{ padding: '12px 16px', background: '#ecfeff', color: '#164e63', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {info}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Enter your full name" 
              className="form-input"
              required 
              style={{ fontSize: '16px', padding: '14px 16px' }}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              className="form-input"
              required 
              style={{ fontSize: '16px', padding: '14px 16px' }}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPwd ? 'text' : 'password'} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Create a strong password" 
                className="form-input"
                required 
                style={{ fontSize: '16px', padding: '14px 44px 14px 16px' }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 8, top: 8, padding: '6px 8px', background: '#111', color: '#fff', borderRadius: 6 }}>
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Password must be at least 6 characters long
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', fontSize: '14px', color: '#64748b', lineHeight: '1.4' }}>
              <input type="checkbox" style={{ marginRight: '8px', marginTop: '2px' }} required />
              I agree to the <Link to="/terms" style={{ color: '#667eea' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#667eea' }}>Privacy Policy</Link>
            </label>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: '16px', padding: '16px', background: '#000', color: '#fff' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
            <span style={{ color: '#64748b' }}>
              Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
