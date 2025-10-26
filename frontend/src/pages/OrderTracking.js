import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../Services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError(err?.response?.data?.msg || err.message || 'Failed to load order');
      }
      setLoading(false);
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Poll every 10s for updates
    return () => clearInterval(interval);
  }, [id]);


  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage msg={error} />;

  const step = order.status === 'Delivered' ? 3 : order.status === 'Shipped' ? 2 : 1;
  const statusLabel = order.status === 'Pending' ? 'Order Placed' : order.status;
  const shipCourier = order.courierName || order.tracking?.courierName || '';
  const shipTracking = order.trackingId || order.tracking?.trackingId || '';
  const shipUrl = order.courierUrl || order.tracking?.url || '';

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>Order Tracking</h1>
        <p style={{ color: '#cbd5e1' }}>Order #{order.orderId || (order._id || '').slice(-8)}</p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24, background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, color: '#cbd5e1' }}>Current Status</p>
            <h3 style={{ margin: 0, color: '#ffffff' }}>{statusLabel}</h3>
          </div>
          <div style={{ fontWeight: 700, color: '#ffffff' }}>${(order.total || 0).toFixed(2)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
          {['Order Placed','Shipped','Delivered'].map((label, idx) => {
            const active = idx + 1 <= step;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: active ? '#10b981' : '#e2e8f0' }} />
                <span style={{ fontSize: 12, color: active ? '#0f766e' : '#94a3b8' }}>{label}</span>
                {idx < 2 && <div style={{ width: 40, height: 2, background: active ? '#a7f3d0' : '#e2e8f0' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {(shipCourier || shipTracking || order.status === 'Shipped' || order.status === 'Delivered') && (
        <div className="card" style={{ padding: 24, marginBottom: 24, background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 12 }}>Shipping Details</h3>
          <p style={{ margin: 0, color: '#e5e7eb' }}>Courier: <strong>{shipCourier || '—'}</strong></p>
          <p style={{ margin: '4px 0 0', color: '#e5e7eb' }}>Tracking ID: <strong>{shipTracking || '—'}</strong></p>
          {(shipUrl || shipTracking) && (
            <p style={{ marginTop: 8 }}>
              <a href={shipUrl || (function(){ const n=(shipCourier||'').toLowerCase(); const id=encodeURIComponent(shipTracking||''); if(!id) return '#'; if(n.includes('bluedart')) return `https://www.bluedart.com/track?track=${id}`; if(n.includes('dtdc')) return `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${id}`; if(n.includes('delhivery')) return `https://www.delhivery.com/track/package/${id}`; if(n.includes('ekart')) return `https://ekartlogistics.com/track/${id}`; if(n.includes('xpressbees')) return `https://www.xpressbees.com/track-shipment?isawb=Yes&trackid=${id}`; if(n.includes('india post')||n.includes('speed post')) return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`; return '#'; })()} target="_blank" rel="noreferrer" className="btn-primary">Track Package</a>
            </p>
          )}
        </div>
      )}

      {/* Shipping Address */}
      <div className="card" style={{ padding: 24, marginBottom: 24, background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 12 }}>Shipping Address</h3>
        <p style={{ margin: 0, color: '#e5e7eb' }}>
          {(() => { const a = order.shippingAddress || {}; const parts = [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean); return parts.length ? parts.join(', ') : '—'; })()}
        </p>
      </div>

      <div className="card" style={{ padding: 24, background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 12 }}>Items</h3>
        {(order.items || []).map((it) => {
          const unit = it.price || it.product?.price || 0;
          const total = unit * (it.qty || 0);
          const img = it.product?.image || (Array.isArray(it.product?.images) && it.product.images[0]) || '/api/placeholder/80/80';
          return (
            <div key={(it.product?._id || Math.random()) + String(it.qty) + (it.size || '')} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #333' }}>
              <img src={img} alt="item" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #333' }} />
              <div>
                <div style={{ color: '#e5e7eb', fontWeight: 600 }}>{it.product?.name || 'Product'}</div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>
                  {it.size ? `Size: ${it.size}` : ''} {it.size ? '• ' : ''}Qty: {it.qty}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: 12 }}>${unit.toFixed(2)} each</div>
              </div>
              <div style={{ color: '#ffffff', fontWeight: 700 }}>${total.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

export default OrderTracking;
