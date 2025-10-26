import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const categories = [
    { name: 'All Products', path: '/products', icon: '🛍️' },
    { name: 'Streetwear', path: '/products?category=Streetwear', icon: '👕' },
    { name: 'Sportswear', path: '/products?category=Sportswear', icon: '👖' },
    { name: 'Dailywear', path: '/products?category=Dailywear', icon: '👟' },
    { name: 'Accessories', path: '/products?category=accessories', icon: '👜' },
  ];

    const quickLinks = [
      { name: 'Home', path: '/', icon: '🏠' },
      { name: 'Cart', path: '/cart', icon: '🛒' },
      { name: 'Wishlist', path: '/wishlist', icon: '❤️' },
      { name: 'Profile', path: '/profile', icon: '👤' },
      { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header with Toggle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {!isCollapsed && (
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#1e293b', 
            margin: 0 
          }}>
            Dashboard
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#64748b',
            padding: '8px',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          {isCollapsed ? '☰' : '✕'}
        </button>
      </div>

      {/* Brand Section */}
      {!isCollapsed && (
        <div style={{ 
          marginBottom: '40px', 
          paddingBottom: '24px', 
          borderBottom: '1px solid #e2e8f0' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '12px' 
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: '8px', 
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '18px'
            }}>
              FW
            </div>
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#1e293b', 
                margin: 0 
              }}>
                Fight Widom
              </h2>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                margin: 0 
              }}>
                Quality wear for every occasion
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="sidebar-section">
        {!isCollapsed && <h3 className="sidebar-title">Quick Links</h3>}
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
            title={isCollapsed ? link.name : ''}
          >
            <span style={{ fontSize: '16px' }}>{link.icon}</span>
            {!isCollapsed && <span style={{ marginLeft: '12px' }}>{link.name}</span>}
          </Link>
        ))}
      </div>

      {/* Categories */}
      <div className="sidebar-section">
        {!isCollapsed && <h3 className="sidebar-title">Categories</h3>}
        {categories.map((category) => (
          <Link
            key={category.path}
            to={category.path}
            className={`sidebar-link ${location.pathname === category.path ? 'active' : ''}`}
            title={isCollapsed ? category.name : ''}
          >
            <span style={{ fontSize: '16px' }}>{category.icon}</span>
            {!isCollapsed && <span style={{ marginLeft: '12px' }}>{category.name}</span>}
          </Link>
        ))}
      </div>

      {/* Orders Section */}
      <div className="sidebar-section">
        {!isCollapsed && <h3 className="sidebar-title">Orders</h3>}
        <Link 
          to="/orders" 
          className="sidebar-link"
          title={isCollapsed ? 'My Orders' : ''}
        >
          <span style={{ fontSize: '16px' }}>📦</span>
          {!isCollapsed && <span style={{ marginLeft: '12px' }}>My Orders</span>}
        </Link>
      </div>

      {/* Bottom Spacer */}
      <div style={{ flex: 1 }}></div>
      
      {/* Footer */}
      <div style={{ 
        paddingTop: '24px', 
        borderTop: '1px solid #e2e8f0',
        marginTop: '24px'
      }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#94a3b8', 
          textAlign: 'center',
          margin: 0 
        }}>
          © 2024 Fight Widom
        </p>
      </div>
    </div>
  );
};

export default Sidebar;