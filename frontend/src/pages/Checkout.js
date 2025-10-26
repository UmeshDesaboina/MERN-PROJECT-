import React, { useEffect, useState, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import api from '../Services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [] });
  const [paymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const isMounted = useRef(true);
  const history = useHistory();

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to checkout');
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


  const handleCheckout = async () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      alert('Please fill in all shipping address fields');
      return;
    }

    try {
      setIsPlacingOrder(true);
      const items = cart.items.map(i => ({ 
        product: i.product._id, 
        qty: i.qty, 
        price: i.product.price,
        size: i.size || ''
      }));
      
      const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
      const total = subtotal;
      
      const orderData = {
        items,
        subtotal,
        total,
        paymentMethod,
        shippingAddress
      };

      const res = await api.post('/orders', orderData);
      
      if (isMounted.current) {
        alert('Order placed successfully!');
        history.push(`/order/${res.data._id}`);
      }
    } catch (err) {
      alert(err?.response?.data?.msg || 'Failed to place order');
    } finally {
      if (isMounted.current) {
        setIsPlacingOrder(false);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  const subtotal = cart.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.qty, 0) || 0;
  const total = subtotal;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Checkout</h1>
        <p style={{ color: '#cbd5e1' }}>Review your order and complete your purchase</p>
      </div>

      {error ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', background: '#0b0b0b', border: '1px solid #333', color: '#fff' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
            {error}
          </h3>
          <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
            Please login to proceed with checkout
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
            Add some items to proceed with checkout
          </p>
          <Link to="/products" className="btn-primary">
            Shop Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
          {/* Order Details */}
          <div>
            {/* Shipping Address */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>
                Shipping Address
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ color: '#ffffff' }}>Street Address</label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={e => setShippingAddress({...shippingAddress, street: e.target.value})}
                    className="form-input"
                    placeholder="Enter street address"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ color: '#ffffff' }}>City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={e => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className="form-input"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ color: '#ffffff' }}>State</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={e => setShippingAddress({...shippingAddress, state: e.target.value})}
                      className="form-input"
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ color: '#ffffff' }}>ZIP Code</label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={e => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                      className="form-input"
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ color: '#ffffff' }}>Country</label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={e => setShippingAddress({...shippingAddress, country: e.target.value})}
                      className="form-input"
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method (Online disabled) */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                Payment Method
              </h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#e5e7eb' }}>
                <input type="radio" checked readOnly style={{ marginRight: 8 }} />
                Cash on Delivery
              </div>
            </div>

            </div>

          {/* Order Summary */}
          <div>
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>
                Order Summary
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                {cart.items.map(item => (
                  <div key={item.product?._id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', margin: 0 }}>
                        {item.product?.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                        Qty: {item.qty}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {item.size && <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Size: {item.size}</span>}
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                        ${((item.product?.price || 0) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#cbd5e1' }}>Subtotal:</span>
                  <span style={{ color: '#ffffff' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#cbd5e1' }}>Shipping:</span>
                  <span style={{ color: '#ffffff' }}>Free</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '12px',
                  borderTop: '2px solid #333',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#ffffff'
                }}>
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '16px',
                  fontSize: '16px',
                  opacity: isPlacingOrder ? 0.7 : 1
                }}
              >
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </button>

              <Link to="/cart" style={{ 
                display: 'block', 
                textAlign: 'center', 
                marginTop: '12px',
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '14px'
              }}>
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Checkout;