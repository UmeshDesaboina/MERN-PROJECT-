import React from 'react';
import { Link } from 'react-router-dom';
import localLogo from '../assets/logo.svg';
const LOGO_URL = 'https://iili.io/KrEPWoF.png';

const Home = () => (
  <div style={{ background: '#000', minHeight: '100vh', width: '100%', color: '#fff' }}>
    <div className="container" style={{ padding: '20px 16px' }}>
    {/* Hero Section */}
    <div style={{ 
      background: '#000', 
      borderRadius: '20px', 
      padding: '60px 40px', 
      marginBottom: '60px',
      color: 'white',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <img src={LOGO_URL} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = localLogo; }} alt="Fight Wisdom logo" style={{ width: '160px', height: '160px', objectFit: 'contain', marginBottom: '16px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))', background: '#0b0b0b', padding: '8px', borderRadius: '12px' }} />
        <h1 style={{ 
          fontSize: '56px', 
          fontWeight: '800', 
          marginBottom: '20px',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Welcome to Fight Wisdom
        </h1>
        <p style={{ 
          fontSize: '24px', 
          marginBottom: '40px', 
          opacity: 0.9,
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Discover quality wear for street, sports, and daily use. Your style, our passion.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" style={{ 
            display: 'inline-block',
            padding: '14px 28px', 
            background: 'white', 
            color: '#667eea', 
            borderRadius: '12px', 
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '16px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }}>
            Shop Now
          </Link>
          <Link to="/products?category=Streetwear" style={{ 
            display: 'inline-block',
            padding: '12px 24px', 
            background: 'transparent', 
            color: 'white', 
            border: '2px solid white',
            borderRadius: '12px', 
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.3s ease'
          }}>
            Browse Categories
          </Link>
        </div>
      </div>
    </div>

    {/* Categories Section */}
    <div style={{ marginBottom: '60px' }}>
      <h2 style={{ 
        fontSize: '36px', 
        fontWeight: '700', 
        color: '#ffffff', 
        textAlign: 'center', 
        marginBottom: '16px' 
      }}>
        Shop by Category
      </h2>
      <p style={{ 
        fontSize: '18px', 
        color: '#cbd5e1', 
        textAlign: 'center', 
        marginBottom: '40px',
        maxWidth: '600px',
        margin: '0 auto 40px'
      }}>
        Find exactly what you're looking for in our carefully curated categories
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '40px 30px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '1px solid #333',
          background: '#0b0b0b',
          color: '#fff'
        }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '24px',
            color: '#ffffff',
            filter: 'brightness(0) invert(1)'
          }}>👕</div>
      <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Streetwear</h3>
      <p style={{ color: '#cbd5e1', marginBottom: '24px', fontSize: '16px', lineHeight: '1.6' }}>
            Trendy street fashion for the urban lifestyle. Express your individuality with our curated collection.
          </p>
          <Link to="/products?category=Streetwear" style={{ 
            color: '#ffffff', 
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Explore Streetwear <span>→</span>
          </Link>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '40px 30px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '1px solid #333',
          background: '#0b0b0b',
          color: '#fff'
        }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '24px',
            color: '#ffffff',
            filter: 'brightness(0) invert(1)'
          }}>👖</div>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Sportswear</h3>
          <p style={{ color: '#cbd5e1', marginBottom: '24px', fontSize: '16px', lineHeight: '1.6' }}>
            Performance gear for active lifestyles. Stay comfortable and stylish during your workouts.
          </p>
          <Link to="/products?category=Sportswear" style={{ 
            color: '#ffffff', 
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Explore Sportswear <span>→</span>
          </Link>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '40px 30px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '1px solid #333',
          background: '#0b0b0b',
          color: '#fff'
        }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '24px',
            color: '#ffffff',
            filter: 'brightness(0) invert(1)'
          }}>👟</div>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>Dailywear</h3>
          <p style={{ color: '#cbd5e1', marginBottom: '24px', fontSize: '16px', lineHeight: '1.6' }}>
            Comfortable essentials for everyday wear. Perfect for work, casual outings, and everything in between.
          </p>
          <Link to="/products?category=Dailywear" style={{ 
            color: '#ffffff', 
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Explore Dailywear <span>→</span>
          </Link>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div className="card" style={{ 
      textAlign: 'center', 
      padding: '60px 40px',
      background: '#0b0b0b',
      border: '1px solid #333'
    }}>
      <h2 style={{ 
        fontSize: '36px', 
        fontWeight: '700', 
        color: '#ffffff', 
        marginBottom: '20px' 
      }}>
        Why Choose Fight Wisdom?
      </h2>
      <p style={{ 
        fontSize: '18px', 
        color: '#cbd5e1', 
        marginBottom: '50px',
        maxWidth: '600px',
        margin: '0 auto 50px'
      }}>
        We're committed to providing you with the best shopping experience
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '40px',
        marginTop: '40px'
      }}>
        <div>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            color: '#ffffff',
            filter: 'brightness(0) invert(1)'
          }}>✨</div>
          <h4 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>Premium Quality</h4>
          <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6' }}>
            Carefully selected materials and expert craftsmanship ensure lasting quality
          </p>
        </div>
        
        <div>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            color: '#ffffff',
            filter: 'brightness(0) invert(1)'
          }}>🚚</div>
          <h4 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>Fast Shipping</h4>
          <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6' }}>
            Quick and reliable delivery to your doorstep with tracking updates
          </p>
        </div>
        
        <div>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            color: '#ffffff',
            filter: 'brightness(0) invert(1)'
          }}>💯</div>
          <h4 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>Customer First</h4>
          <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6' }}>
            Dedicated support team ready to help with any questions or concerns
          </p>
        </div>
        
        <div>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            color: '#ffffff',
            filter: 'brightness(0) invert(1)'
          }}>🔄</div>
          <h4 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '12px' }}>Easy Returns</h4>
          <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.6' }}>
            Hassle-free returns and exchanges within 30 days of purchase
          </p>
        </div>
      </div>
    </div>
    </div>
  </div>
);

export default Home;