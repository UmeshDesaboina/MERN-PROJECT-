import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../Services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ products: [] });
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
      setError('Please login to view your wishlist');
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cartwishlist/wishlist');
      if (isMounted.current) {
        setWishlist(res.data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err?.response?.data?.msg || 'Failed to load wishlist');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete('/cartwishlist/wishlist', { data: { productId } });
      fetchWishlist();
    } catch (err) {
      alert(err?.response?.data?.msg || 'Failed to remove item');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>My Wishlist</h1>
        <p style={{ color: '#cbd5e1' }}>Save items you love for later</p>
      </div>

      {error ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', background: '#0b0b0b', border: '1px solid #333', color: '#fff' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
            {error}
          </h3>
          <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
            Please login to view your wishlist
          </p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      ) : wishlist.products?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', background: '#0b0b0b', border: '1px solid #333', color: '#fff' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
            Your wishlist is empty
          </h3>
          <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
            Add items you love to your wishlist
          </p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="products-grid" style={{ color: '#fff' }}>
            {wishlist.products.map(product => (
              <div key={product._id} style={{ position: 'relative' }}>
                <ProductCard product={product} />
                <button 
                  onClick={() => removeItem(product._id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    zIndex: 10
                  }}
                  title="Remove from wishlist"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '24px', textAlign: 'center', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
              Found {wishlist.products?.length} item{wishlist.products?.length !== 1 ? 's' : ''} in your wishlist
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
              Keep adding items you love or start shopping
            </p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Wishlist;