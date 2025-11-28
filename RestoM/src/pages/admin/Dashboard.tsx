import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orders } from '../../data/orders';
import {
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaUtensils,
  FaRupeeSign,
} from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [localOrders, setLocalOrders] = useState(orders);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin');
  }, [navigate]);

  const totalOrders = localOrders.length;
  const totalRevenue = localOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = localOrders.filter(o => o.status !== 'Served').length;
  const completedOrders = localOrders.filter(o => o.status === 'Served').length;

  const updateOrderStatus = (id: string, status: 'Pending' | 'Preparing' | 'Served') => {
    setLocalOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Preparing':
        return 'bg-info text-white';
      case 'Served':
        return 'bg-success text-white';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {/* 🔑 Main background color uses CSS variable for dynamic theme support */}
      <div className="container-fluid py-4" style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: '100vh', color: 'var(--color-text-primary)' }}>
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="display-6 fw-bold text-primary" style={{ color: 'var(--color-text-primary)' }}>Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          {[
            { icon: <FaShoppingCart />, label: 'Total Orders', value: totalOrders, color: '#FF6B00' },
            { icon: <FaRupeeSign />, label: 'Revenue', value: `₹${totalRevenue.toFixed(2)}`, color: '#00B050' },
            { icon: <FaClock />, label: 'Active Orders', value: activeOrders, color: '#FF9500' },
            { icon: <FaCheckCircle />, label: 'Completed', value: completedOrders, color: '#17A2B8' },
          ].map((card, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div
                className="card shadow-sm border-0 h-100 text-center"
                style={{
                  // Background gradient retained for vibrant look
                  background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`,
                  color: 'white', // Text color remains white for contrast on gradient
                  borderRadius: '12px',
                }}
              >
                <div className="card-body">
                  <div className="fs-1 mb-3">{card.icon}</div>
                  <h3 className="fw-bold mb-1">{card.value}</h3>
                  <p className="mb-0">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Section */}
        <div 
            className="card border-0 shadow-sm p-3" 
            style={{ 
                borderRadius: '12px', 
                backgroundColor: 'var(--color-bg-primary)', // 🔑 Card background
                color: 'var(--color-text-primary)'
            }}>
          <div
            className="d-flex justify-content-between align-items-center mb-3"
            style={{ borderBottom: `2px solid var(--color-border)` }} // 🔑 Border color adjustment
          >
            <h5 className="fw-semibold d-flex align-items-center">
              <FaUtensils className="me-2 text-warning" /> Recent Orders
            </h5>
            <span className="badge bg-warning text-dark">{localOrders.length} orders</span>
          </div>

          {/* Order Cards (Desktop View) */}
          <div className="d-none d-md-block">
            {localOrders.map(order => (
              <div
                key={order.id}
                className="d-flex align-items-center justify-content-between p-3 mb-2 rounded"
                style={{
                  backgroundColor: 'var(--color-bg-primary)', // 🔑 Item card background
                  boxShadow: '0 1px 3px var(--color-shadow)', // 🔑 Item card shadow
                  border: `1px solid var(--color-border)`
                }}
              >
                <div className="col-md-2 fw-bold" style={{ color: 'var(--color-text-primary)' }}>{order.id}</div>

                <div className="col-md-2">
                  <div className="fw-semibold" style={{ color: 'var(--color-text-primary)' }}>{order.customerName}</div>
                  <small style={{ color: 'var(--color-text-muted)' }}>{order.customerEmail}</small>
                </div>

                <div className="col-md-3">
                  {order.items.map(item => (
                    <div key={item.id} className="small" style={{ color: 'var(--color-text-primary)' }}>
                      {item.name} <span className="badge bg-light text-dark">x{item.quantity}</span>{' '}
                      {item.spiceLevel && (
                        <span className="badge bg-warning text-dark">{item.spiceLevel}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  className="col-md-1 fw-bold"
                  style={{
                    // Revenue gradient retained
                    background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ₹{order.total.toFixed(2)}
                </div>

                <div className="col-md-2">
                  <span className={`badge ${getStatusBadgeClass(order.status)} px-3 py-2`}>
                    {order.status}
                  </span>
                </div>

                <div className="col-md-2">
                  <select
                    className="form-select form-select-sm shadow-sm"
                    style={{ borderRadius: '8px', backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }} // 🔑 Select box theme
                    value={order.status}
                    onChange={e =>
                      updateOrderStatus(order.id, e.target.value as 'Pending' | 'Preparing' | 'Served')
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Served">Served</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile View (Responsive) */}
          <div className="d-md-none">
            {localOrders.map(order => (
              <div
                key={order.id}
                className="p-3 mb-3 rounded shadow-sm"
                style={{ 
                    borderLeft: '5px solid orange', 
                    backgroundColor: 'var(--color-bg-primary)', // 🔑 Item card background
                    color: 'var(--color-text-primary)'
                }}
              >
                <div className="fw-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{order.customerName}</div>
                <small style={{ color: 'var(--color-text-muted)' }}>{order.customerEmail}</small>
                <div className="mt-2">
                  {order.items.map(item => (
                    <div key={item.id} className="d-flex align-items-center small" style={{ color: 'var(--color-text-primary)' }}>
                      <span className="me-2">{item.name}</span>
                      <span className="badge bg-light text-dark me-2">x{item.quantity}</span>
                      {item.spiceLevel && (
                        <span className="badge bg-warning text-dark">{item.spiceLevel}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <span 
                        className="fw-bold" 
                        style={{
                            // Revenue gradient retained for consistency
                            background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                        ₹{order.total.toFixed(2)}
                    </span>
                  <span className={`badge ${getStatusBadgeClass(order.status)} px-3`}>
                    {order.status}
                  </span>
                </div>
                <select
                  className="form-select form-select-sm mt-2"
                  value={order.status}
                  onChange={e =>
                    updateOrderStatus(order.id, e.target.value as 'Pending' | 'Preparing' | 'Served')
                  }
                  style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }} // 🔑 Select box theme
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Served">Served</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;