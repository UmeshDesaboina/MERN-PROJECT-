import React, { useState, useEffect, useRef } from 'react';
import api from '../Services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalProducts: 0, totalRevenue: 0 });
  const [filters, setFilters] = useState({
    userSearch: '',
    orderStatus: '',
    dateFrom: '',
    dateTo: ''
  });
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    description: '', 
    price: 0, 
    stock: 0, 
    category: 'Streetwear',
    image: '',
    images: [],
    imageCount: 1,
    brand: 'Fight Wisdom'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  // Local edits to shipping fields keyed by order id
  const [shippingUpdates, setShippingUpdates] = useState({});
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      setError('Please login to access admin dashboard');
      setLoading(false);
      return;
    }
    
    if (!user.isAdmin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    
    fetchData();
  }, []);

  // Test function to create admin user
  const createTestAdmin = async () => {
    try {
      const response = await api.post('/auth/register', {
        name: 'Admin User',
        email: 'admin@fightwidom.com',
        password: 'admin123',
        isAdmin: true
      });
      console.log('Admin user created:', response.data);
      alert('Admin user created successfully! Please login with admin@fightwidom.com / admin123');
    } catch (err) {
      console.error('Error creating admin user:', err);
      alert('Error creating admin user: ' + (err?.response?.data?.msg || 'Unknown error'));
    }
  };

    const fetchData = async () => {
      try {
      setLoading(true);
      console.log('Fetching admin data...');
      
      // Check authentication first
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        setError('Please login to access admin dashboard');
        setLoading(false);
        return;
      }
      
      if (!user.isAdmin) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      
      // Try to fetch data from API
      try {
        const [usersRes, ordersRes, productsRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/orders'),
          api.get('/admin/products'),
          api.get('/admin/stats')
        ]);
        
        console.log('Admin data fetched successfully from API:', {
          users: usersRes.data,
          orders: ordersRes.data,
          products: productsRes.data,
          stats: statsRes.data
        });
        
        if (isMounted.current) {
          setUsers(usersRes.data);
          setOrders(ordersRes.data);
          setProducts(productsRes.data || []);
          setStats(statsRes.data);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // If API fails, show error but don't fall back to mock data
        if (isMounted.current) {
          setError('Failed to fetch data from server. Please check your connection and try again.');
        }
      }
      } catch (err) {
      console.error('Error fetching admin data:', err);
      if (isMounted.current) {
        setError(err?.response?.data?.msg || 'Failed to fetch data');
      }
    } finally {
      if (isMounted.current) {
      setLoading(false);
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newProduct.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!newProduct.description.trim()) {
      setError('Product description is required');
      return;
    }
    if (newProduct.price <= 0) {
      setError('Product price must be greater than 0');
      return;
    }
    if (newProduct.stock < 0) {
      setError('Stock cannot be negative');
      return;
    }
    
    try {
      setError(''); // Clear any previous errors
      console.log('Creating product:', newProduct);
      const response = await api.post('/admin/products', newProduct);
      console.log('Product created successfully:', response.data);
      setNewProduct({ name: '', description: '', price: 0, stock: 0, category: 'Streetwear', image: '', images: [], imageCount: 1, brand: 'Fight Wisdom' });
      fetchData();
      alert('Product created successfully!');
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err?.response?.data?.msg || 'Failed to create product');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/products/${editingProduct._id}`, editingProduct);
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
    fetchData();
      } catch (err) {
        setError(err?.response?.data?.msg || 'Failed to delete product');
      }
    }
  };


  const updateOrderStatus = async (id, status) => {
    try {
      const s = shippingUpdates[id] || {};
      const payload = { status };
      if (status === 'Shipped') {
        payload.courierName = s.courierName ?? undefined;
        payload.trackingId = s.trackingId ?? undefined;
        payload.courierUrl = s.courierUrl ?? undefined;
      }
      await api.put(`/admin/orders/${id}/status`, payload);
      // Clear local shipping edits for this order so UI reflects saved values from server
      setShippingUpdates(prev => { const next = { ...prev }; delete next[id]; return next; });
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to update order status');
    }
  };

  const toggleUserStatus = async (userId, isBlocked) => {
    try {
      await api.put(`/admin/users/${userId}/block`, { isBlocked });
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.msg || 'Failed to update user status');
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(filters.userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(filters.userSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filters.orderStatus || order.status === filters.orderStatus;
    const matchesDateFrom = !filters.dateFrom || new Date(order.createdAt) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(order.createdAt) <= new Date(filters.dateTo);
    return matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // CSV Export functions
  const exportUsersCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Admin', 'Blocked', 'Created At'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.isAdmin ? 'Yes' : 'No',
        user.isBlocked ? 'Yes' : 'No',
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportOrdersCSV = () => {
    const csvContent = [
      ['Order ID', 'User', 'Status', 'Total Amount', 'Created At'],
      ...filteredOrders.map(order => [
        order._id,
        order.user?.name || 'N/A',
        order.status,
        order.total || 0,
        new Date(order.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <div className="container-fluid">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ color: '#cbd5e1' }}>Manage your e-commerce store</p>
        
        {/* Test Admin Creation Button */}
        <div style={{ marginTop: '16px' }}>
          <button 
            onClick={createTestAdmin}
            className="btn-secondary"
            style={{ padding: '8px 16px' }}
          >
            Create Test Admin User
          </button>
        </div>
      </div>

      {error && <ErrorMessage msg={error} />}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ textAlign: 'center', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>{stats.totalUsers}</h3>
          <p style={{ color: '#cbd5e1' }}>Total Users</p>
        </div>
        <div className="card" style={{ textAlign: 'center', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>{stats.totalOrders}</h3>
          <p style={{ color: '#cbd5e1' }}>Total Orders</p>
        </div>
        <div className="card" style={{ textAlign: 'center', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛍️</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>{stats.totalProducts}</h3>
          <p style={{ color: '#cbd5e1' }}>Total Products</p>
        </div>
        <div className="card" style={{ textAlign: 'center', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>${stats.totalRevenue}</h3>
          <p style={{ color: '#cbd5e1' }}>Total Revenue</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '2px solid #222' }}>
        {['overview', 'products', 'orders', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              border: '1px solid #222',
              background: activeTab === tab ? '#111' : 'transparent',
              color: activeTab === tab ? '#fff' : '#cbd5e1',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '24px' }}>Recent Orders</h2>
          <div className="card" style={{ background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
            {orders.slice(0, 5).map(order => (
              <div key={order._id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 0', 
                borderBottom: '1px solid #e2e8f0' 
              }}>
                <div>
                  <p style={{ fontWeight: '600', color: '#ffffff' }}>Order #{order._id.slice(-6)}</p>
                  <p style={{ color: '#cbd5e1', fontSize: '14px' }}>{order.user?.name || 'Unknown User'}</p>
                  {(order.items || []).length > 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: 4 }}>
                      {(order.items || []).slice(0,2).map((it, idx) => (
                        <span key={idx}>
                          {(it.product?.name || 'Product')}{it.size ? ` (Size: ${it.size})` : ''} × {it.qty}{idx < Math.min((order.items || []).length,2)-1 ? ' • ' : ''}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '600', color: '#ffffff' }}>${order.total}</p>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Shipped' ? '#dbeafe' : '#fef3c7',
                    color: order.status === 'Delivered' ? '#166534' : order.status === 'Shipped' ? '#1e40af' : '#92400e'
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>Products</h2>
            <button 
              onClick={() => setEditingProduct({ name: '', description: '', price: 0, stock: 0, category: 'Streetwear', image: '' })}
              className="btn-primary"
              style={{ padding: '8px 16px' }}
            >
              Add Product
            </button>
          </div>

          {/* Add New Product Form */}
          <div className="card" style={{ marginBottom: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Product</h3>
            <form onSubmit={handleCreateProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="form-input"
                    required
                  >
                    <option value="Streetwear">Streetwear</option>
                    <option value="Sportswear">Sportswear</option>
                    <option value="Dailywear">Dailywear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="form-input"
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Images</label>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                    How many images do you want to add?
                  </label>
                  <select
                    value={newProduct.imageCount || 1}
                    onChange={e => {
                      const count = parseInt(e.target.value);
                      setNewProduct({...newProduct, imageCount: count, images: newProduct.images || []});
                    }}
                    className="form-input"
                    style={{ width: '100px' }}
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                {Array.from({length: newProduct.imageCount || 1}).map((_, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b' }}>Image {index + 1} URL:</label>
                    <input
                      type="url"
                      value={newProduct.images?.[index] || ''}
                      onChange={e => {
                        const images = [...(newProduct.images || [])];
                        images[index] = e.target.value;
                        setNewProduct({...newProduct, images, image: images[0] || ''});
                      }}
                      className="form-input"
                      placeholder={`https://example.com/image${index + 1}.jpg`}
                      style={{ fontSize: '14px' }}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="btn-primary">
                Create Product
              </button>
            </form>
          </div>

          {/* Edit Product Form */}
          {editingProduct && (
            <div className="card" style={{ marginBottom: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
              <h3 style={{ marginBottom: '16px' }}>Edit Product</h3>
              <form onSubmit={handleUpdateProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="form-input"
                    >
                      <option value="Streetwear">Streetwear</option>
                      <option value="Sportswear">Sportswear</option>
                      <option value="Dailywear">Dailywear</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="form-input"
                    rows="3"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-primary">
                    {editingProduct._id ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={() => setEditingProduct(null)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {products.map(product => (
              <div key={product._id} className="card" style={{ background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>{product.name}</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px' }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#ffffff' }}>${product.price}</span>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: product.stock > 0 ? '#dcfce7' : '#fecaca',
                      color: product.stock > 0 ? '#166534' : '#dc2626'
                    }}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setEditingProduct(product)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>Orders ({filteredOrders.length})</h2>
            <button onClick={exportOrdersCSV} className="btn-secondary">
              📊 Export CSV
            </button>
          </div>

          {/* Order Filters */}
            <div className="card" style={{ marginBottom: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Filters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label className="form-label">Status</label>
                <select
                  value={filters.orderStatus}
                  onChange={e => setFilters({...filters, orderStatus: e.target.value})}
                  className="form-input"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={e => setFilters({...filters, dateFrom: e.target.value})}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={e => setFilters({...filters, dateTo: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="card">
            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  No orders found
                </h3>
                <p style={{ color: '#64748b' }}>
                  {filters.orderStatus || filters.dateFrom || filters.dateTo ? 'Try adjusting your filter criteria' : 'No orders placed yet'}
                </p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <div key={order._id} className="card" style={{ 
                  padding: '16px 20px', 
                  marginBottom: '16px',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  background: '#0b0b0b',
                  color: '#e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                        Order #{order.orderId || order._id.slice(-6)}
                      </h3>
                      <p style={{ color: '#cbd5e1', fontSize: '14px' }}>Customer: {order.user?.name || 'Unknown'}</p>
                      <p style={{ color: '#cbd5e1', fontSize: '14px' }}>Total: ${order.total}</p>
                      {/* Shipping Address */}
                      <p style={{ color: '#cbd5e1', fontSize: '12px', marginTop: 4 }}>
                        <strong style={{ color: '#e5e7eb' }}>Address:</strong> {(() => { const a = order.shippingAddress || {}; const parts = [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean); return parts.length ? parts.join(', ') : '—'; })()}
                      </p>
                      {order.paymentMethod === 'ONLINE' && (
                        <p style={{ color: '#cbd5e1', fontSize: '12px', marginTop: 4 }}>
                          Payment: <strong>{order.paymentStatus || 'Pending'}</strong>{order.transactionId ? ` • TX: ${order.transactionId}` : ''}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: 12,
                        marginRight: 8,
                        background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Shipped' ? '#dbeafe' : order.status === 'Processing' ? '#fde68a' : '#e2e8f0',
                        color: order.status === 'Delivered' ? '#166534' : order.status === 'Shipped' ? '#1e40af' : order.status === 'Processing' ? '#92400e' : '#334155'
                      }}>{order.status}</span>
                      <select
                        value={order.status}
                        onChange={e => {
                          const next = e.target.value;
                          if (next === 'Shipped') {
                            const s = shippingUpdates[order._id] || {};
                            const hasCourier = (s.courierName ?? order.courierName) && (s.trackingId ?? order.trackingId);
                            if (!hasCourier) {
                              alert('Enter courier name and tracking ID before marking as Shipped. Use the fields below and click Ship Order.');
                              return;
                            }
                          }
                          updateOrderStatus(order._id, next);
                        }}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid #e2e8f0',
                          marginBottom: '8px'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Items with sizes and pricing */}
                  <div style={{ margin: '8px 0 12px', padding: '8px', border: '1px solid #222', borderRadius: 8, background: '#0f0f0f' }}>
                    {(order.items || []).map((it, idx) => {
                      const unit = it.price || it.product?.price || 0;
                      const total = unit * (it.qty || 0);
                      const img = it.product?.image || (Array.isArray(it.product?.images) && it.product.images[0]) || '';
                      return (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #222' }}>
                          {img ? <img src={img} alt="item" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #333' }} /> : <div />}
                          <div>
                            <div style={{ color: '#e5e7eb' }}>{it.product?.name || 'Product'} {it.size ? <span style={{ color: '#94a3b8', fontSize: 12 }}>(Size: {it.size})</span> : null}</div>
                            <div style={{ color: '#94a3b8', fontSize: 12 }}>Qty: {it.qty} • ${unit.toFixed(2)} each</div>
                          </div>
                          <div style={{ color: '#ffffff', fontWeight: 600 }}>${total.toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping inputs for courier and tracking */}
                  <div className="grid-2-sm-1" style={{ gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="form-label">Courier Name</label>
                      <input
                        type="text"
                        value={(shippingUpdates[order._id]?.courierName ?? order.courierName ?? '')}
                        onChange={e => setShippingUpdates(prev => ({ ...prev, [order._id]: { ...(prev[order._id] || {}), courierName: e.target.value } }))}
                        className="form-input"
                        placeholder="e.g., BlueDart, DTDC, Delhivery"
                      />
                    </div>
                    <div>
                      <label className="form-label">Tracking ID</label>
                      <input
                        type="text"
                        value={(shippingUpdates[order._id]?.trackingId ?? order.trackingId ?? '')}
                        onChange={e => setShippingUpdates(prev => ({ ...prev, [order._id]: { ...(prev[order._id] || {}), trackingId: e.target.value } }))}
                        className="form-input"
                        placeholder="e.g., BLR123456789"
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Tracking URL (optional)</label>
                      <input
                        type="url"
                        value={(shippingUpdates[order._id]?.courierUrl ?? order.courierUrl ?? '')}
                        onChange={e => setShippingUpdates(prev => ({ ...prev, [order._id]: { ...(prev[order._id] || {}), courierUrl: e.target.value } }))}
                        className="form-input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => {
                        const s = shippingUpdates[order._id] || {};
                        if (!s.courierName || !s.trackingId) {
                          alert('Enter courier name and tracking ID before shipping');
                          return;
                        }
                        updateOrderStatus(order._id, 'Shipped');
                      }}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      title="Set status to Shipped with courier details"
                    >
                      Ship Order
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order._id, 'Delivered')}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Mark Delivered
                    </button>
                  </div>

                  {/* Payment verification for ONLINE */}
                  {order.paymentMethod === 'ONLINE' && (
                    <div style={{ marginTop: '12px' }}>
                      <label className="form-label" style={{ fontSize: 12 }}>Verify Payment</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={(shippingUpdates[order._id]?.adminTxId ?? order.transactionId ?? '')}
                          onChange={e => setShippingUpdates(prev => ({ ...prev, [order._id]: { ...(prev[order._id] || {}), adminTxId: e.target.value } }))}
                          placeholder="Transaction/UTR ID"
                          className="form-input"
                          style={{ maxWidth: 320 }}
                        />
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={async () => {
                            try {
                              await api.put(`/orders/${order._id}/transaction`, { success: true, transactionId: (shippingUpdates[order._id]?.adminTxId || order.transactionId || '') });
                              fetchData();
                            } catch (err) {
                              alert(err?.response?.data?.msg || 'Failed to mark as Paid');
                            }
                          }}
                        >
                          Mark Paid
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={async () => {
                            try {
                              await api.put(`/orders/${order._id}/transaction`, { success: false });
                              fetchData();
                            } catch (err) {
                              alert(err?.response?.data?.msg || 'Failed to mark as Failed');
                            }
                          }}
                        >
                          Mark Failed
                        </button>
                      </div>
                    </div>
                  )}

                  {(order.status === 'Shipped' || order.status === 'Delivered') && (
                    <p style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>
                      Saved: Courier {order.courierName || order.tracking?.courierName || '—'} • Tracking {order.trackingId || order.tracking?.trackingId || '—'} { (order.courierUrl || order.tracking?.url) ? '• ' : ''}{(order.courierUrl || order.tracking?.url) && (<a href={order.courierUrl || order.tracking?.url} target="_blank" rel="noreferrer">Track</a>)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>Users ({filteredUsers.length})</h2>
            <button onClick={exportUsersCSV} className="btn-secondary">
              📊 Export CSV
            </button>
          </div>

          {/* User Filters */}
          <div className="card" style={{ marginBottom: '24px', background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>Filters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label className="form-label">Search Users</label>
                <input
                  type="text"
                  value={filters.userSearch}
                  onChange={e => setFilters({...filters, userSearch: e.target.value})}
                  placeholder="Search by name or email..."
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ background: '#0b0b0b', border: '1px solid #333', color: '#e5e7eb' }}>
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                  No users found
                </h3>
                <p style={{ color: '#cbd5e1' }}>
                  {filters.userSearch ? 'Try adjusting your search criteria' : 'No users registered yet'}
                </p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div key={user._id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '16px 0', 
                  borderBottom: '1px solid #e2e8f0' 
                }}>
                  <div>
                    <p style={{ fontWeight: '600', color: '#ffffff' }}>{user.name}</p>
                    <p style={{ color: '#cbd5e1', fontSize: '14px' }}>{user.email}</p>
                    <p style={{ color: '#cbd5e1', fontSize: '12px' }}>
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: user.isBlocked ? '#fecaca' : '#dcfce7',
                      color: user.isBlocked ? '#dc2626' : '#166534'
                    }}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                    <button 
                      onClick={() => toggleUserStatus(user._id, !user.isBlocked)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        if (window.confirm('Delete this user? This action cannot be undone.')) {
                          try {
                            try {
                              await api.delete(`/admin/users/${user._id}`);
                            } catch (e1) {
                              if (e1?.response?.status === 404) {
                                // Fallback route
                                await api.delete(`/users/${user._id}`);
                              } else {
                                throw e1;
                              }
                            }
                            fetchData();
                          } catch (err) {
                            alert(err?.response?.data?.msg || 'Failed to delete user');
                          }
                        }
                      }}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      title="Delete user"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default AdminDashboard;