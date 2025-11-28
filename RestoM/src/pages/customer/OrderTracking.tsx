import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCheckCircle, FaUtensils, FaMapMarkerAlt, FaCreditCard, FaWallet, FaMobileAlt, FaShoppingBag } from 'react-icons/fa'
 
const OrderTracking: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [orderType, setOrderType] = useState<string>('')
 
  useEffect(() => {
    const method = sessionStorage.getItem('paymentMethod') || 'card'
    const type = sessionStorage.getItem('orderType') || 'Dine-In'
    setPaymentMethod(method)
    setOrderType(type)
  }, [])
 
  const getPaymentIcon = () => {
    switch (paymentMethod) {
      case 'upi': return <FaMobileAlt className="text-primary me-2" />
      case 'wallet': return <FaWallet className="text-success me-2" />
      case 'card': return <FaCreditCard className="text-warning me-2" />
      default: return <FaCreditCard className="text-secondary me-2" />
    }
  }
 
  const getOrderTypeIcon = () => {
    return orderType === 'Takeaway'
      ? <FaShoppingBag className="text-info me-2" />
      : <FaUtensils className="text-danger me-2" />
  }
 
  return (
    <div className="container py-5" style={{ minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
 
          <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
            <div className="d-flex justify-content-center align-items-center">
  <FaCheckCircle className="text-success mb-3" size={50} />
</div>

            <h3 className="fw-bold mb-1">Order Confirmed!</h3>
            <p className="text-muted mb-4">Thank you for your payment.</p>
 
            {/* Payment Info */}
            <div className="d-flex align-items-center justify-content-center mb-3">
              {getPaymentIcon()}
              <h6 className="mb-0 fw-semibold">
                {paymentMethod === 'upi'
                  ? 'Paid via UPI'
                  : paymentMethod === 'wallet'
                  ? 'Paid via Wallet'
                  : 'Paid via Credit/Debit Card'}
              </h6>
            </div>
 
            {/* Order Type */}
            <div className="d-flex align-items-center justify-content-center mb-4">
              {getOrderTypeIcon()}
              <h6 className="mb-0 fw-semibold">
                {orderType} Order
              </h6>
            </div>
 
            {/* Tracking Steps */}
            <div className="text-start">
              <div className="d-flex align-items-center mb-3">
                <FaUtensils className="text-success me-3" />
                <div>
                  <h6 className="fw-semibold mb-0">Order Being Prepared</h6>
                  <small className="text-muted">Your meal is being cooked fresh</small>
                </div>
              </div>
 
              <div className="d-flex align-items-center mb-3">
                <FaMapMarkerAlt className="text-warning me-3" />
                <div>
                  <h6 className="fw-semibold mb-0">Out for Delivery</h6>
                  <small className="text-muted">Your order is on its way</small>
                </div>
              </div>
 
              <div className="d-flex align-items-center">
                <FaCheckCircle className="text-success me-3" />
                <div>
                  <h6 className="fw-semibold mb-0">Delivered</h6>
                  <small className="text-muted">Enjoy your meal!</small>
                </div>
              </div>
            </div>
 
            <Link to="/" className="btn mt-4 w-100 rounded-pill text-white fw-semibold py-2"
              style={{ background: 'linear-gradient(90deg, #FFA500, #FF6B00)' }}>
              Back to Home
            </Link>
          </div>
 
        </div>
      </div>
    </div>
  )
}
 
export default OrderTracking