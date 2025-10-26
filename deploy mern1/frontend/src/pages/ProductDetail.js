import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../Services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [id]);

    const fetchProduct = async () => {
      try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      if (isMounted.current) {
        setProduct(res.data);
      }
      } catch (err) {
      if (isMounted.current) {
        setError(err?.response?.data?.msg || 'Failed to load product');
      }
    } finally {
      if (isMounted.current) {
      setLoading(false);
      }
    }
    };

  const addToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }
    
    try {
      setIsAddingToCart(true);
      await api.post('/cartwishlist/cart', { productId: id, qty: quantity, size: selectedSize });
      alert('Added to cart successfully!');
    } catch (err) {
      alert(err?.response?.data?.msg || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to wishlist');
      return;
    }
    
    try {
      setIsAddingToWishlist(true);
      await api.post('/cartwishlist/wishlist', { productId: id });
      alert('Added to wishlist successfully!');
    } catch (err) {
      alert(err?.response?.data?.msg || 'Failed to add to wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage msg={error} />;
  if (!product) return null;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        {/* Product Images Gallery */}
        <div>
          <div style={{ marginBottom: 10 }}>
            <img 
              src={(product.image || (product.images && product.images[0])) || '/api/placeholder/500/500'} 
              alt={product.name} 
              style={{ 
                width: '100%', 
                height: '400px',
                objectFit: 'cover',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
              onError={(e) => { e.target.src = '/api/placeholder/500/500'; }}
            />
          </div>
          {Array.isArray(product.images) && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {product.images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`thumb-${idx}`} 
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #333', cursor: 'pointer' }}
                  onClick={() => setProduct(p => ({ ...p, image: img }))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
      <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#ffffff', 
            marginBottom: '16px' 
          }}>
            {product.name}
          </h1>
          
          <p style={{ 
            fontSize: '18px', 
            color: '#cbd5e1', 
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            {product.description}
          </p>

          <div style={{ marginBottom: '24px' }}>
            <span style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#ffffff' 
            }}>
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ 
                fontSize: '20px', 
                color: '#94a3b8', 
                textDecoration: 'line-through',
                marginLeft: '12px'
              }}>
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Sizes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: 16, fontWeight: 500, color: '#ffffff', marginBottom: 8 }}>Size:</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(product.sizes && product.sizes.length ? product.sizes : ['S','M','L','XL'])
                .filter(sz => String(sz).toUpperCase() !== 'XXL')
                .map(sz => {
                  const active = selectedSize === sz;
                  return (
                    <button key={sz} type="button" onClick={() => setSelectedSize(sz)} style={{ border: '1px solid #333', padding: '6px 10px', borderRadius: 6, color: active ? '#000' : '#e5e7eb', background: active ? '#fff' : 'transparent', cursor: 'pointer' }}>
                      {sz}
                    </button>
                  );
                })}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <span style={{ 
              padding: '6px 12px', 
              background: product.stock > 0 ? '#10b981' : '#ef4444',
              color: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              Quantity:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1px solid #222',
                  background: '#000',
                  color: '#fff',
                  cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  opacity: quantity <= 1 ? 0.5 : 1
                }}
              >
                -
              </button>
              <span style={{ 
                minWidth: '60px', 
                textAlign: 'center', 
                fontWeight: '600',
                fontSize: '16px'
              }}>
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1px solid #222',
                  background: '#000',
                  color: '#fff',
                  cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  opacity: quantity >= product.stock ? 0.5 : 1
                }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
            <button 
              onClick={addToCart}
              disabled={!product.stock || isAddingToCart}
              className="btn-primary"
              style={{ 
                flex: 1, 
                padding: '16px',
                fontSize: '16px',
                opacity: !product.stock ? 0.5 : 1,
                cursor: !product.stock ? 'not-allowed' : 'pointer'
              }}
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              onClick={addToWishlist}
              disabled={isAddingToWishlist}
              className="btn-secondary"
              style={{ 
                flex: 1, 
                padding: '16px',
                fontSize: '16px'
              }}
            >
              {isAddingToWishlist ? 'Adding...' : 'Add to Wishlist'}
            </button>
          </div>

          <div style={{ 
            padding: '20px', 
            background: '#0b0b0b', 
            borderRadius: '8px',
            border: '1px solid #333',
            color: '#e5e7eb'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              Product Details
            </h3>
            <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Brand:</strong> {product.brand || 'Fight Wisdom'}</p>
              <p><strong>SKU:</strong> {product.sku || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card" style={{ padding: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#ffffff',
          marginBottom: '20px'
        }}>
          Customer Reviews
        </h2>
        
        {product.reviews && product.reviews.length > 0 ? (
          <div style={{ marginBottom: '24px' }}>
            {product.reviews.map((review, index) => (
              <div key={index} style={{ 
                padding: '16px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ marginRight: '8px' }}>
                    {'⭐'.repeat(review.rating)}
                  </span>
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                    {review.user?.name || review.user?.email || review.userName || 'Anonymous'}
                  </span>
                </div>
                <p style={{ color: '#e5e7eb', margin: 0 }}>
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
            No reviews yet. Be the first to review this product!
          </p>
        )}

        <div style={{ 
          padding: '20px', 
          background: '#0b0b0b', 
          borderRadius: '8px',
          border: '1px solid #333',
          color: '#e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#ffffff',
            marginBottom: '16px'
          }}>
            Write a Review
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              Rating:
            </label>
            <select 
              value={rating} 
              onChange={e => setRating(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #333',
                background: '#111',
                color: '#e5e7eb',
                fontSize: '14px'
              }}
            >
              <option value={0}>Select Rating</option>
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              Comment:
            </label>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                background: '#111',
                color: '#e5e7eb',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>
          <button 
            onClick={async () => {
              if (!rating || !comment.trim()) {
                alert('Please provide both rating and comment');
                return;
              }
              const token = localStorage.getItem('token');
              if (!token) {
                alert('Please login to submit a review');
                return;
              }
              try {
                const res = await api.post(`/products/${id}/reviews`, { rating, comment });
                setProduct(res.data);
                setRating(0);
                setComment('');
                alert('Review submitted successfully!');
              } catch (err) {
                alert(err?.response?.data?.msg || 'Failed to submit review');
              }
            }}
            className="btn-primary"
            style={{ padding: '12px 24px' }}
          >
            Submit Review
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductDetail;