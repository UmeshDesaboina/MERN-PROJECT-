import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../Services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => () => { isMounted.current = false; }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        if (isMounted.current) setOrders(res.data || []);
      } catch (err) {
        if (isMounted.current) setError(err?.response?.data?.msg || 'Failed to load orders');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10s for live updates
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#fef3c7', fg: '#92400e' };
      case 'Processing': return { bg: '#dbeafe', fg: '#1e40af' };
      case 'Shipped': return { bg: '#ede9fe', fg: '#6d28d9' };
      case 'Delivered': return { bg: '#dcfce7', fg: '#166534' };
      case 'Cancelled': return { bg: '#fee2e2', fg: '#991b1b' };
      default: return { bg: '#e2e8f0', fg: '#334155' };
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage msg={error} />;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>My Orders</h1>
        <p style={{ color: '#cbd5e1' }}>Track the status of your orders and view details</p>
      </div>

      <div className="card" style={{ background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#ffffff', marginBottom: 8 }}>You haven't placed any orders yet</h3>
            <p style={{ color: '#cbd5e1', marginBottom: 20 }}>Browse products and place your first order</p>
            <Link to="/products" className="btn-primary">Shop Now</Link>
          </div>
        ) : (
          orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(order => {
              const colors = getStatusColor(order.status);
              const statusLabel = order.status === 'Pending' ? 'Order Placed' : order.status;
              const step = order.status === 'Delivered' ? 3 : order.status === 'Shipped' ? 2 : 1;
              const shipCourier = order.courierName || order.tracking?.courierName || '';
              const shipTracking = order.trackingId || order.tracking?.trackingId || '';
              const shipUrl = order.courierUrl || order.tracking?.url || '';
              return (
                <div key={order._id} style={{
                  padding: '16px 0',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>
                        Order #{order.orderId || order._id.slice(-8)}
                      </h3>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        background: colors.bg,
                        color: colors.fg
                      }}>{statusLabel}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 4 }}>
                      {['Order Placed','Shipped','Delivered'].map((label, idx) => {
                        const active = idx + 1 <= step;
                        return (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: active ? '#10b981' : '#e2e8f0'
                            }} />
                            <span style={{ fontSize: 12, color: active ? '#0f766e' : '#94a3b8' }}>{label}</span>
                            {idx < 2 && <div style={{ width: 24, height: 2, background: active ? '#a7f3d0' : '#e2e8f0' }} />}
                          </div>
                        );
                      })}
                    </div>
                    {(order.items || []).length > 0 && (
                      <p style={{ color: '#94a3b8', fontSize: 12, margin: '4px 0' }}>
                        {(order.items || []).slice(0,2).map((it, idx) => (
                          <span key={idx}>
                            {(it.product?.name || 'Product')}{it.size ? ` (Size: ${it.size})` : ''} × {it.qty}{idx < Math.min((order.items || []).length,2)-1 ? ' • ' : ''}
                          </span>
                        ))}
                      </p>
                    )}
                    <p style={{ color: '#cbd5e1', fontSize: 14 }}>
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p style={{ fontWeight: 600, color: '#ffffff' }}>${(order.total || 0).toFixed(2)}</p>

                    {/* Shipping Address */}
                    <div style={{ marginTop: 6, color: '#cbd5e1', fontSize: 12 }}>
                      <strong style={{ color: '#e5e7eb' }}>Shipping Address:</strong>
                      <div>
                        {(() => { const a = order.shippingAddress || {}; const parts = [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean); return parts.length ? parts.join(', ') : '—'; })()}
                      </div>
                    </div>

                    {/* Shipping details always visible after Shipped */}
                    {(order.status === 'Shipped' || order.status === 'Delivered') && (
                      <p style={{ color: '#334155', fontSize: 12, marginTop: 4 }}>
                        Courier: <strong>{shipCourier || '—'}</strong>
                        {' '}• Tracking: <strong>{shipTracking || '—'}</strong>
                        { (shipUrl || shipTracking) && (
                          <>
                            {' '}•{' '}
                            <a href={shipUrl || (function(){ const n=(shipCourier||'').toLowerCase(); const id=encodeURIComponent(shipTracking||''); if(!id) return '#'; if(n.includes('bluedart')) return `https://www.bluedart.com/track?track=${id}`; if(n.includes('dtdc')) return `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${id}`; if(n.includes('delhivery')) return `https://www.delhivery.com/track/package/${id}`; if(n.includes('ekart')) return `https://ekartlogistics.com/track/${id}`; if(n.includes('xpressbees')) return `https://www.xpressbees.com/track-shipment?isawb=Yes&trackid=${id}`; if(n.includes('india post')||n.includes('speed post')) return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`; return '#'; })()} target="_blank" rel="noreferrer">Track</a>
                          </>
                        ) }
                      </p>
                    )}

                    {/* Items summary with size */}
                    <div style={{ marginTop: 8 }}>
                      {(order.items || []).map((it) => (
                        <div key={(it.product?._id || Math.random()) + (it.size || '')} style={{ fontSize: 12, color: '#cbd5e1' }}>
                          {(it.product?.name || 'Product')} {it.size ? `(Size: ${it.size})` : ''} × {it.qty}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/order/${order._id}`} className="btn-secondary">Track</Link>
                  </div>
                </div>
              );
            })
        )}
      </div>
      </div>
    </div>
  );
};

export default MyOrders;
