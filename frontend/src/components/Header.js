import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import localLogo from '../assets/logo.svg';
const LOGO_URL = 'https://iili.io/KrEPWoF.png';

const Header = () => {
  const [search, setSearch] = useState('');
  const history = useHistory();
  const user = JSON.parse(localStorage.getItem('user')); // Simple auth check

  const handleSearch = (e) => {
    e.preventDefault();
    history.push(`/products?search=${search}`);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    history.push('/login');
  };

  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 10, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '14px 20px', 
      background: '#0b0b0b', 
      borderBottom: '1px solid #222', 
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Logo - clickable to home */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img 
          src={LOGO_URL}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = localLogo; }}
          alt="Fight Wisdom logo"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            background: '#0b0b0b',
            borderRadius: '8px',
            padding: '4px',
            marginRight: '12px'
          }}
        />
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Fight Wisdom</span>
      </Link>
      
      {/* Search Bar - Centered */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 800, position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search products..." 
            style={{ 
              width: '100%', 
              padding: '12px 20px 12px 50px', 
              borderRadius: '25px', 
              border: '1px solid #222', 
              background: '#111',
              color: '#e5e7eb',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: 'none'
            }} 
          />
          <div style={{
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9aa0a6',
            fontSize: '16px'
          }}>
            🔍
          </div>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </form>
      
      {/* Cart, Wishlist, and My Orders */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '20px' }}>
        <Link to="/cart" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '6px',
          background: '#111',
          color: '#e5e7eb',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #222',
          position: 'relative'
        }}>
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcgNEg1VjJIM1Y0SDFWMTlIMjNWNEg3WiIgZmlsbD0iIzY0NzQ4YiIvPgo8Y2lyY2xlIGN4PSI5IiBjeT0iMjEiIHI9IjIiIGZpbGw9IiM2NDc0OGIiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMSIgcj0iMiIgZmlsbD0iIzY0NzQ4YiIvPgo8L3N2Zz4K" 
            alt="Cart" 
            style={{ width: '20px', height: '20px', filter: 'invert(1) brightness(1.2)' }}
          />
          Cart
        </Link>
        <Link to="/wishlist" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '6px',
          background: '#111',
          color: '#e5e7eb',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          border: '1px solid #222'
        }}>
          <span style={{ fontSize: '16px', filter: 'brightness(0) invert(1)' }}>❤️</span>
          Wishlist
        </Link>
        {user && (
          <Link to="/orders" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            background: '#111',
            color: '#e5e7eb',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid #222'
          }}>
            <span style={{ fontSize: '16px', filter: 'brightness(0) invert(1)' }}>🧾</span>
            My Orders
          </Link>
        )}
      </div>

      {/* User Actions - Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#e5e7eb'
              }}>
                {user.name}
              </span>
            </div>
            {user.isAdmin && (
              <Link to="/admin" style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#333',
                color: '#e5e7eb',
                fontWeight: '500',
                textDecoration: 'none',
                fontSize: '14px',
                border: '1px solid #222'
              }}>Admin</Link>
            )}
            <button onClick={logout} style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}>Logout</button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" style={{
              padding: '8px 16px',
              borderRadius: '6px',
              color: '#e5e7eb',
              fontWeight: '500',
              textDecoration: 'none',
              fontSize: '14px'
            }}>Login</Link>
            <Link to="/register">
              <button style={{
                padding: '8px 16px',
                background: '#111',
                color: '#e5e7eb',
                border: '1px solid #222',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}>Sign up</button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
