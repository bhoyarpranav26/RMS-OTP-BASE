import React, { useState, useEffect } from 'react';
import { FaBars, FaUserCircle, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';
 
interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

// 🔑 Theme Logic: Helper function to get initial theme
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark' ? 'dark' : 'light';
  }
  return 'light';
};
 
const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // 🔑 Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
 
  // Detect window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔑 Theme Side Effect: Apply theme to body and localStorage
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
 
  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };
 
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
 
  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    setShowProfileMenu(false);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔑 Theme toggle handler
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    // setShowProfileMenu(false); // Do not close the profile menu if the toggle button is inside
  };
 
  return (
    <>
      {/* 🔑 Minimal Style Addition: Dynamic Theme Styles via CSS Variables */}
      <style global jsx>{`
        body[data-theme='light'] {
          --color-bg-primary: #ffffff; /* Navbar, Card BG */
          --color-bg-secondary: #f8f9fa; /* Main Layout BG */
          --color-text-primary: #212529; /* Dark Text */
          --color-text-muted: #6c757d;
          --color-shadow: rgba(0, 0, 0, 0.1);
          --color-border: #dee2e6;
          --color-sidebar-bg: #fff8e1; /* Sidebar light BG */
          --color-sidebar-gradient-end: #ffe082;
          --color-sidebar-text: #8d6e63;
          --color-sidebar-active-bg: #fff3e0;
          --color-sidebar-active-text: #ff6b35;
        }

        body[data-theme='dark'] {
          --color-bg-primary: #1e1e1e;
          --color-bg-secondary: #252525;
          --color-text-primary: #f8f9fa;
          --color-text-muted: #adb5bd;
          --color-shadow: rgba(255, 255, 255, 0.1);
          --color-border: #343a40;
          --color-sidebar-bg: #2b2b2b; /* Sidebar dark BG */
          --color-sidebar-gradient-end: #3c3c3c;
          --color-sidebar-text: #adb5bd;
          --color-sidebar-active-bg: #404040;
          --color-sidebar-active-text: #ff9900;
        }

        .admin-layout, .admin-main {
          background-color: var(--color-bg-secondary) !important;
          color: var(--color-text-primary) !important;
        }
        .admin-navbar {
          background: var(--color-bg-primary) !important;
          box-shadow: 0 2px 10px var(--color-shadow) !important;
          border-bottom: 1px solid var(--color-border) !important;
        }
        .admin-navbar h5, .admin-navbar .btn-link, .admin-navbar .dropdown-item {
          color: var(--color-text-primary) !important;
        }
        .profile-menu-container .bg-white {
          background-color: var(--color-bg-primary) !important;
          border: 1px solid var(--color-border) !important;
        }
        .profile-menu-container .border-bottom, .profile-menu-container .border-top {
          border-color: var(--color-border) !important;
        }
        .dropdown-item:hover, .dropdown-item:focus {
          background-color: var(--color-bg-secondary) !important;
        }
        /* Update for sidebar styles */
        .admin-sidebar {
            background: linear-gradient(180deg, var(--color-sidebar-bg), var(--color-sidebar-gradient-end)) !important;
            border-right-color: var(--color-border) !important;
        }
        .sidebar-header .fw-bold {
            color: var(--color-sidebar-text) !important;
        }
        .sidebar-menu .sidebar-link {
            color: var(--color-sidebar-text) !important;
        }
        .sidebar-menu .sidebar-link.active {
            color: var(--color-sidebar-active-text) !important;
            background-color: var(--color-sidebar-active-bg) !important;
        }
        .sidebar-footer .logout-btn {
            background: var(--color-sidebar-active-bg) !important;
            border-color: var(--color-border) !important;
            color: var(--color-sidebar-text) !important;
        }
        .sidebar-footer .logout-btn:hover {
            background: var(--color-sidebar-gradient-end) !important;
        }
      `}</style>
      
      <div className={`admin-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* 🔹 Navbar */}
        <nav className="admin-navbar navbar navbar-expand-lg navbar-light" style={{
          position: 'sticky',
          top: 0,
          zIndex: 1020,
        }}>
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <button
              className="btn btn-link text-dark border-0 me-3 d-lg-none"
              type="button"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              style={{
                fontSize: '1.2rem',
                padding: '0.5rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaBars />
            </button>

            {!isMobile && <span className="navbar-brand mb-0 fw-bold text-dark"></span>}

            <div className="d-flex align-items-center flex-grow-1 justify-content-center">
              {title && (
                <h5 className="text-dark mb-0 d-none d-md-block fw-semibold">{title}</h5>
              )}
            </div>

            {/* 🔑 Theme Switch (New placement in Navbar Header) */}
            <div className="d-flex align-items-center me-3">
                <button
                    className="btn btn-link border-0 d-flex align-items-center gap-2"
                    onClick={toggleTheme}
                    aria-label="Toggle light/dark mode"
                    style={{
                        color: 'var(--color-text-primary)',
                        fontSize: '1.2rem',
                        transition: 'color 0.2s',
                    }}
                >
                    {theme === 'light' ? <FaMoon /> : <FaSun className="text-warning" />}
                </button>
            </div>


            {/* User Profile Section */}
            <div className="d-flex align-items-center position-relative profile-menu-container">
              <button
                className="btn btn-link text-dark border-0 d-flex align-items-center gap-2"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  textDecoration: 'none',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FaUserCircle size={24} />
                <span className="d-none d-md-inline fw-semibold">Admin</span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div
                  className="position-absolute bg-white shadow-lg rounded-3 border-0"
                  style={{
                    top: '100%',
                    right: 0,
                    minWidth: '200px',
                    zIndex: 1050,
                    marginTop: '8px'
                  }}
                >
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <FaUserCircle size={32} className="text-primary" />
                      <div>
                        <div className="fw-semibold text-dark">Administrator</div>
                        <small className="text-muted">admin@restom.com</small>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    {/* The Theme Toggle button has been moved to the Navbar header above, but keeping a profile setting link is optional */}
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-dark">
                      <FaUserCircle size={16} />
                      <span>Profile Settings</span>
                    </button>
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-dark">
                      <FaBars size={16} />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="border-top">
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-danger">
                      <FaSignOutAlt size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      
        {/* 🔹 Sidebar */}
        <AdminSidebar
          onToggle={setSidebarCollapsed}
          isOpen={isMobile ? sidebarOpen : true}
          theme={theme} // 🔑 Pass theme state to sidebar
        />
      
        {/* 🔹 Overlay for Mobile */}
        {sidebarOpen && isMobile && (
          <div
            className="sidebar-overlay"
            onClick={handleOverlayClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1030
            }}
          />
        )}
      
      
        {/* 🔹 Main Content */}
        <main
          className={`admin-main ${
            sidebarCollapsed ? 'sidebar-collapsed' : ''
          } ${sidebarOpen ? 'sidebar-open' : ''}`}
        >
          {children}
        </main>
      </div>
    </>
  );
};
 
export default AdminLayout;