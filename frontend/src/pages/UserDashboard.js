import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../Services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view your dashboard');
          return;
        }

        const [ordersRes, userRes] = await Promise.all([
          api.get('/orders'),
          api.get('/users/profile')
        ]);

        if (isMounted.current) {
          setOrders(ordersRes.data);
          setUser(userRes.data);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err?.response?.data?.msg || 'Failed to load dashboard data');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage msg={error} />;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Processing': return '#3b82f6';
      case 'Shipped': return '#8b5cf6';
      case 'Delivered': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Manage your orders and account settings
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            {orders.length}
          </h3>
          <p style={{ color: '#64748b' }}>Total Orders</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            {orders.filter(o => o.status === 'Delivered').length}
          </h3>
          <p style={{ color: '#64748b' }}>Delivered</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            {orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status)).length}
          </h3>
          <p style={{ color: '#64748b' }}>In Progress</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b' }}>
            Recent Orders
          </h2>
          <Link to="/orders" style={{ 
            color: '#667eea', 
            fontWeight: '500', 
            textDecoration: 'none' 
          }}>
            View All
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              No orders yet
            </h3>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>
              Start shopping to see your orders here
            </p>
            <Link to="/products" className="btn-primary">
              Shop Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {orders.slice(0, 5).map(order => (
              <div key={order._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                    Order #{order._id.slice(-8)}
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {(order.items || []).length > 0 && (
                    <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>
                      {(order.items || []).slice(0,2).map((it, idx) => (
                        <span key={idx}>
                          {(it.product?.name || 'Product')}{it.size ? ` (Size: ${it.size})` : ''} × {it.qty}{idx < Math.min((order.items || []).length,2)-1 ? ' • ' : ''}
                        </span>
                      ))}
                    </p>
                  )}
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                    ${order.total?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status)
                  }}>
                    {order.status}
                  </span>
                  <div style={{ marginTop: '8px' }}>
                    <Link 
                      to={`/order/${order._id}`}
                      style={{
                        color: '#667eea',
                        fontSize: '14px',
                        fontWeight: '500',
                        textDecoration: 'none'
                      }}
                    >
                      Track Order →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
          Quick Actions
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px' 
        }}>
          <Link to="/products" className="btn-primary" style={{ textAlign: 'center', padding: '16px' }}>
            🛍️ Browse Products
          </Link>
          <Link to="/cart" className="btn-secondary" style={{ textAlign: 'center', padding: '16px' }}>
            🛒 View Cart
          </Link>
          <Link to="/wishlist" className="btn-secondary" style={{ textAlign: 'center', padding: '16px' }}>
            ❤️ My Wishlist
          </Link>
          <Link to="/profile" className="btn-secondary" style={{ textAlign: 'center', padding: '16px' }}>
            👤 Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
