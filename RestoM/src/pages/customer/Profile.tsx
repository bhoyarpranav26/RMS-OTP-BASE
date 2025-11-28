import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { orders } from '../../data/orders'
import { FaUser, FaEnvelope, FaPhone, FaShoppingCart, FaHistory } from 'react-icons/fa'

const Profile: React.FC = () => {
  const { user } = useAuth()
  const { cart } = useCart()

  if (!user) {
    return <div>Please login to view your profile</div>
  }

  // Filter orders by user's email
  const userOrders = orders.filter(order => order.customerEmail === user.email)

  // Current order is the cart items
  const currentOrderItems = cart

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-4 mb-4">
          {/* Customer Information */}
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"><FaUser className="me-2" />Customer Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Name:</strong> {user.name}
              </div>
              <div className="mb-3">
                <FaEnvelope className="me-2 text-primary" />
                <strong>Email:</strong> {user.email}
              </div>
              <div className="mb-3">
                <FaPhone className="me-2 text-primary" />
                <strong>Phone:</strong> {user.phone || 'Not provided'}
              </div>
              {user.profilePicture && (
                <div className="mb-3">
                  <img src={user.profilePicture} alt="Profile" className="img-fluid rounded" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          {/* Current Order */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0"><FaShoppingCart className="me-2" />Current Order</h5>
            </div>
            <div className="card-body">
              {currentOrderItems.length > 0 ? (
                <div>
                  {currentOrderItems.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{item.name}</strong> (x{item.quantity})
                        {item.spiceLevel && <span className="text-muted"> - {item.spiceLevel}</span>}
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong>${currentOrderItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-muted">No items in current order</p>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><FaHistory className="me-2" />Order History</h5>
            </div>
            <div className="card-body">
              {userOrders.length > 0 ? (
                userOrders.map((order) => (
                  <div key={order.id} className="border-bottom mb-3 pb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong>Order #{order.id}</strong>
                        <br />
                        <small className="text-muted">
                          {new Date(order.orderTime).toLocaleDateString()} at {new Date(order.orderTime).toLocaleTimeString()}
                        </small>
                      </div>
                      <span className={`badge ${order.status === 'Served' ? 'bg-success' : order.status === 'Preparing' ? 'bg-warning' : 'bg-secondary'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="small">
                          {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                          {item.spiceLevel && <span className="text-muted"> - {item.spiceLevel}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">Delivery: {order.deliveryAddress}</small>
                      <strong>Total: ${order.total.toFixed(2)}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No order history available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile