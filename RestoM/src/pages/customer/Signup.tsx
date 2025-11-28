import React, { useState } from 'react'
import axios from 'axios'
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaArrowLeft } from 'react-icons/fa'

const API_BASE_URL = 'http://localhost:5000/api/auth'

interface SignupProps {
  onClose: () => void
  onSwitchToLogin: () => void
  onSignup: (userData: { name: string; email: string; phone: string; password: string }) => void
}

interface OTPVerificationProps {
  email: string
  onVerify: (otp: string) => void
  onResend: () => void
  onBack: () => void
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onVerify, onResend, onBack }) => {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleVerifyClick = () => {
    if (otp.length === 6) {
      setIsLoading(true)
      setTimeout(() => {
        onVerify(otp)
        setIsLoading(false)
      }, 500)
    }
  }

  const handleResendClick = () => {
    onResend()
    setResendTimer(30)
    setCanResend(false)
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn btn-link text-dark border-0 p-0 me-3" onClick={onBack}>
              <FaArrowLeft />
            </button>
            <button type="button" className="btn-close ms-auto" onClick={() => {}}></button>
          </div>
          <div className="modal-body px-4 pb-4">
            <div className="text-center mb-4">
              <img src="/assets/images/Logo.png" alt="Logo" style={{ width: '120px', height: '40px', objectFit: 'contain' }} />
            </div>
            <h4 className="text-center fw-bold mb-3">Verify Your Email</h4>
            <p className="text-center text-muted mb-4" style={{ fontSize: '14px' }}>
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
            <div className="d-flex justify-content-center gap-2 mb-4">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  maxLength={1}
                  className="form-control text-center fw-bold"
                  style={{ width: '45px', height: '50px', border: '2px solid #FF6A00', borderRadius: '8px' }}
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '')
                    if (val) {
                      const newOtp = otp.split('')
                      newOtp[i] = val
                      setOtp(newOtp.join(''))
                      if (i < 5 && e.target.nextElementSibling)
                        (e.target.nextElementSibling as HTMLInputElement).focus()
                    }
                  }}
                />
              ))}
            </div>

            <button
              className="btn w-100 text-white fw-semibold py-3 mb-3"
              disabled={isLoading || otp.length !== 6}
              onClick={handleVerifyClick}
              style={{
                background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                border: 'none',
                borderRadius: '12px',
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Complete Signup'}
            </button>

            <div className="text-center">
              <span className="text-muted">
                Didn't receive the code?{' '}
                {canResend ? (
                  <button
                    className="btn btn-link p-0 fw-semibold"
                    onClick={handleResendClick}
                    style={{ color: '#FF6A00' }}
                  >
                    Resend Code
                  </button>
                ) : (
                  <span style={{ color: '#FF6A00' }}>Resend in {resendTimer}s</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Signup: React.FC<SignupProps> = ({ onClose, onSwitchToLogin, onSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showOTPVerification, setShowOTPVerification] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsLoading(true);

  try {
    const res = await axios.post(`${API_BASE_URL}/signup`, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    alert(res.data.message || "OTP sent!");
    setShowOTPVerification(true);

  } catch (err: any) {
    alert(err.response?.data?.message || "Signup failed");
  } finally {
    setIsLoading(false);
  }
};


 const handleOTPVerify = async (otp: string) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/verify-otp`, {
      email: formData.email,
      otp: otp,
    });

    alert(res.data.message || "Account verified!");
    setShowOTPVerification(false);
    onSwitchToLogin();

  } catch (err: any) {
    alert(err.response?.data?.message || "Invalid OTP");
  }
};

const handleOTPResend = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/signup`, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    alert(res.data.message || "OTP resent!");
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to resend OTP");
  }
};


  const handleOTPBack = () => setShowOTPVerification(false)

  if (showOTPVerification)
    return (
      <OTPVerification
        email={formData.email}
        onVerify={handleOTPVerify}
        onResend={handleOTPResend}
        onBack={handleOTPBack}
      />
    )

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close ms-auto" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 pb-4">
            <div className="text-center mb-4">
              <img src="/assets/images/Logo.png" alt="Logo" style={{ width: '150px', height: '50px', objectFit: 'contain' }} />
            </div>

            <h4 className="text-center fw-bold mb-4" style={{ color: '#333' }}>
              Create Account
            </h4>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaUser style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    className={`form-control border-start-0 ps-0 ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaEnvelope style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className={`form-control border-start-0 ps-0 ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaPhone style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control border-start-0 ps-0 ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaLock style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-control border-start-0 border-end-0 ps-0 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaLock style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-control border-start-0 border-end-0 ps-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn w-100 text-white fw-semibold py-3 mb-3"
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                  border: 'none',
                  borderRadius: '12px',
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Switch */}
              <div className="text-center">
                <span style={{ color: '#999' }}>Already have an account?</span>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary w-100 fw-semibold py-2"
                onClick={onSwitchToLogin}
                style={{ borderColor: '#FF6A00', color: '#FF6A00' }}
              >
                Sign In Instead
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
