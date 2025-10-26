import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../Services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to view your cart');
      setLoading(false);
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cartwishlist/cart');
      if (isMounted.current) {
        setCart(res.data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err?.response?.data?.msg || 'Failed to load cart');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };


  const removeItem = async (productId) => {
    try {
      await api.delete('/cartwishlist/cart', { data: { productId } });
      fetchCart();
    } catch (err) {
      alert(err?.response?.data?.msg || 'Failed to remove item');
    }
  };

  const updateQuantity = async (productId, newQty) => {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    try {
      await api.put('/cartwishlist/cart', { productId, qty: newQty });
      fetchCart();
    } catch (err) {
      alert(err?.response?.data?.msg || 'Failed to update quantity');
    }
  };

  if (loading) return <LoadingSpinner />;

  const total = cart.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.qty, 0) || 0;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Shopping Cart</h1>
        <p style={{ color: '#cbd5e1' }}>Review your items before checkout</p>
      </div>

      {error ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', background: '#0b0b0b', border: '1px solid #333', color: '#fff' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
            {error}
          </h3>
          <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
            Please login to view your cart
          </p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      ) : cart.items?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', background: '#0b0b0b', border: '1px solid #333', color: '#fff' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
            Your cart is empty
          </h3>
          <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
            Add some items to get started
          </p>
          <Link to="/products" className="btn-primary">
            Shop Now
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
            {cart.items.map(item => (
              <div key={item.product?._id} className="card" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '20px',
                gap: '20px',
                background: '#0b0b0b',
                border: '1px solid #333',
                color: '#e5e7eb'
              }}>
                <img 
                  src={item.product?.image || '/api/placeholder/100/100'} 
                  alt={item.product?.name} 
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px' 
                  }} 
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                    {item.product?.name}
                  </h3>
                  <div style={{ color: '#cbd5e1', fontSize: '12px', marginBottom: '8px' }}>
                    {item.size ? <span style={{ marginRight: 8 }}>Size: <strong>{item.size}</strong></span> : null}
                    <span>{item.product?.description}</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                    ${item.product?.price || 0}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.product?._id, item.qty - 1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '9999px',
                      border: '1px solid #cbd5e1',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#0f172a'
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '48px', textAlign: 'center', fontWeight: '700', fontSize: '16px' }}>
                    {item.qty}
                  </span>
                  <button 
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(item.product?._id, item.qty + 1)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '9999px',
                      border: '1px solid #cbd5e1',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#0f172a'
                    }}
                  >
                    +
                  </button>
                </div>
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                    ${((item.product?.price || 0) * item.qty).toFixed(2)}
                  </p>
                  <button 
                    onClick={() => removeItem(item.product?._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>Order Summary</h3>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
                ${total.toFixed(2)}
              </span>
            </div>


            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/products" className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                Continue Shopping
              </Link>
              <Link to="/checkout" className="btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Cart;