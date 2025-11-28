import React, { useState } from 'react'
import axios from "axios"
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = "http://localhost:5000/api/auth"

interface LoginProps {
  onClose: () => void
  onSwitchToSignup: () => void
  onLogin: () => void
}

const Login: React.FC<LoginProps> = ({ onClose, onSwitchToSignup, onLogin }) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      })

      alert("Login successful!")

      // Use AuthContext to login
      login({
        id: res.data.user.email, // using email as id for now
        name: res.data.user.name,
        email: res.data.user.email,
        phone: res.data.user.phone,
        profilePicture: '' // no profile picture in backend
      })

      onLogin()  // navigation

    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={onClose}
              style={{ fontSize: '14px' }}
            ></button>
          </div>

          <div className="modal-body px-4 pb-4">

            {/* Logo */}
            <div className="text-center mb-4">
              <img
                src="/assets/images/Logo.png"
                alt="Logo"
                style={{ width: '150px', height: '50px', objectFit: 'contain' }}
              />
            </div>

            <h4 className="text-center fw-bold mb-4" style={{ color: '#333' }}>
              Welcome Back
            </h4>

            <form onSubmit={handleSubmit}>

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: '#555' }}>
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaUser style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      borderRadius: '0 8px 8px 0',
                      borderLeft: 'none',
                      padding: '12px 16px'
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ color: '#555' }}>
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                    <FaLock style={{ color: '#FF6A00' }} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      padding: '12px 16px'
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      borderRadius: '0 8px 8px 0',
                      borderLeft: 'none'
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="btn w-100 text-white fw-semibold py-3 mb-3"
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px'
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Forgot Password */}
              <div className="text-center mb-3">
                <a href="#" className="text-decoration-none" style={{ color: '#FF6A00', fontSize: '14px' }}>
                  Forgot Password?
                </a>
              </div>

              {/* Divider */}
              <div className="text-center mb-3">
                <span style={{ color: '#999', fontSize: '14px' }}>Don't have an account?</span>
              </div>

              {/* Switch to Signup */}
              <button
                type="button"
                className="btn btn-outline-secondary w-100 fw-semibold py-2"
                onClick={onSwitchToSignup}
                style={{
                  borderRadius: '12px',
                  borderColor: '#FF6A00',
                  color: '#FF6A00'
                }}
              >
                Create New Account
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
