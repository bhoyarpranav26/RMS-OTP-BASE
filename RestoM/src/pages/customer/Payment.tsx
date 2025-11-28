import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaCreditCard, FaMobileAlt, FaWallet, FaArrowLeft, FaLock, FaUtensils, FaShoppingBag } from 'react-icons/fa'
import { useCart } from '../../context/CartContext'
 
const Payment: React.FC = () => {
  const { getTotalPrice, clearCart } = useCart()
  const navigate = useNavigate()
 
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [upiId, setUpiId] = useState<string>('')
  const [orderType, setOrderType] = useState<'Dine-In' | 'Takeaway'>('Dine-In')
 
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
 
  const subtotal = getTotalPrice()
  const tax = subtotal * 0.05
  const total = subtotal + tax
 
  const handleCardInputChange = (field: string, value: string) => {
    if (field === 'expiryDate') {
      const cleaned = value.replace(/\D/g, '')
      const formatted = cleaned.length >= 2 ? cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) : cleaned
      setCardDetails(prev => ({ ...prev, [field]: formatted }))
    } else if (field === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '')
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
      setCardDetails(prev => ({ ...prev, [field]: formatted.trim() }))
    } else {
      setCardDetails(prev => ({ ...prev, [field]: value }))
    }
  }
 
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: <FaCreditCard className="fs-4 me-3" />, description: 'Pay with your card' },
    { id: 'upi', name: 'UPI', icon: <FaMobileAlt className="fs-4 me-3" />, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'wallet', name: 'Digital Wallet', icon: <FaWallet className="fs-4 me-3" />, description: 'Pay with wallet' }
  ]
 
  const handlePayment = () => {
    sessionStorage.setItem('paymentCompleted', 'true')
    sessionStorage.setItem('paymentMethod', selectedPayment)
    sessionStorage.setItem('orderType', orderType)
    clearCart() // ✅ Empty the cart
    navigate('/order-tracking')
  }
 
  return (
    <div className="container py-5" style={{ backgroundColor: 'var(--background-color)', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
 
          {/* Back Button */}
          <Link to="/cart" className="btn btn-outline-secondary mb-4 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <FaArrowLeft />
          </Link>
 
          {/* Total Card */}
          <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #FFA500, #FF6B00)', color: 'white', borderRadius: '15px' }}>
            <div className="card-body text-center p-4">
              <h4>Total Amount</h4>
              <h2 className="fw-bold">₹{total.toFixed(2)}</h2>
              <p className="mb-0 opacity-75">{orderType} Order</p>
            </div>
          </div>
 
          {/* Order Type Selector */}
          <div className="d-flex justify-content-center mb-4 gap-3">
            <button
              className={`btn rounded-pill fw-semibold px-4 ${orderType === 'Dine-In' ? 'btn-warning text-white' : 'btn-outline-warning'}`}
              onClick={() => setOrderType('Dine-In')}
            >
              <FaUtensils className="me-2" /> Dine-In
            </button>
            <button
              className={`btn rounded-pill fw-semibold px-4 ${orderType === 'Takeaway' ? 'btn-warning text-white' : 'btn-outline-warning'}`}
              onClick={() => setOrderType('Takeaway')}
            >
              <FaShoppingBag className="me-2" /> Takeaway
            </button>
          </div>
 
          {/* Payment Methods */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="fw-bold">Select Payment Method</h5>
            </div>
            <div className="card-body p-4">
 
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`payment-option mb-3 p-3 rounded-3 border cursor-pointer ${
                    selectedPayment === method.id ? 'border-primary bg-light' : 'border-secondary'
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                  style={{ transition: '0.3s', cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <div className="text-primary">{method.icon}</div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-semibold">{method.name}</h6>
                      <p className="mb-0 text-muted small">{method.description}</p>
                    </div>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      checked={selectedPayment === method.id}
                      readOnly
                    />
                  </div>
                </div>
              ))}
 
              {/* UPI Field */}
              {selectedPayment === 'upi' && (
                <div className="mt-4 p-3 bg-light rounded-3">
                  <label className="form-label fw-semibold">UPI ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}
 
              {/* Card Details */}
              {selectedPayment === 'card' && (
                <div className="mt-4 p-4 bg-light rounded-3">
                  <div className="d-flex align-items-center mb-3">
                    <FaLock className="text-success me-2" />
                    <span className="fw-semibold text-dark">Secure Card Payment</span>
                  </div>
 
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                        maxLength={19}
                      />
                    </div>
 
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                        maxLength={5}
                      />
                    </div>
 
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">CVV</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        maxLength={4}
                      />
                    </div>
 
                    <div className="col-12">
                      <label className="form-label fw-semibold">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={cardDetails.cardholderName}
                        onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
 
              {/* Pay Button */}
              <button
                onClick={handlePayment}
                className="btn w-100 mt-4 py-3 fw-semibold rounded-pill text-white"
                style={{
                  background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                  opacity: (
                    !selectedPayment ||
                    (selectedPayment === 'upi' && !upiId) ||
                    (selectedPayment === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName))
                  ) ? 0.6 : 1,
                  pointerEvents: (
                    !selectedPayment ||
                    (selectedPayment === 'upi' && !upiId) ||
                    (selectedPayment === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName))
                  ) ? 'none' : 'auto'
                }}
              >
                Pay ₹{total.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
 
export default Payment