import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaUtensils,
  FaChartLine,
  FaFileAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import "./AdminSidebar.css";
 
interface AdminSidebarProps {
  onToggle?: (collapsed: boolean) => void;
  isOpen?: boolean;
  theme: 'light' | 'dark'; // 🔑 New Theme Prop
}
 
const AdminSidebar: React.FC<AdminSidebarProps> = ({ onToggle, isOpen = false, theme }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
 
  // ✅ Detect window resize to update mobile mode dynamically
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 
  const toggleSidebar = () => {
    if (isMobile) {
      // Toggle full sidebar visibility on mobile
      onToggle?.(!isOpen);
    } else {
      // Collapse on desktop
      const newCollapsed = !collapsed;
      setCollapsed(newCollapsed);
      onToggle?.(newCollapsed);
    }
  };
 
  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (isMobile) {
      onToggle?.(false);
    }
  };
 
  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    window.location.href = "/admin";
  };
 
  const menuItems = [
    { path: "/admin/dashboard", icon: <FaTachometerAlt />, text: "Dashboard" },
    { path: "/admin/menu", icon: <FaUtensils />, text: "Menu Management" },
    { path: "/admin/analytics", icon: <FaChartLine />, text: "Sales Analytics" },
    { path: "/admin/reports", icon: <FaFileAlt />, text: "Reports" },
    { path: "/", icon: <FaUtensils />, text: "Customer Menu" },
  ];
 
  const isActive = (path: string) => location.pathname === path;

  // 🔑 Theme-based inline styles replaced by CSS Variables
  // These will be pulled from the variables defined in AdminLayout's <style> tag.
 
  return (
    <>
      {/* Sidebar */}
      <div
        className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${
          isMobile && isOpen ? "open" : ""
        }`}
        style={{
          // Styles changed to rely on global CSS variables
           // The linear-gradient is now controlled by the CSS variables in AdminLayout
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
          zIndex: 1040,
        }}
      >
        {/* Header */}
        <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          {!collapsed && (
            <h5 className="mb-0 fw-bold" style={{ /* Color handled by CSS variables */ }}>
              🍽️ Admin
            </h5>
          )}
          <button
            className="sidebar-toggle-btn btn btn-link text-dark border-0"
            onClick={toggleSidebar}
            style={{
              color: "var(--color-sidebar-text)", // Using CSS Variable
              fontSize: "1.2rem",
              padding: "0.25rem 0.5rem",
            }}
          >
            <FaBars />
          </button>
        </div>
 
        {/* Menu */}
        <ul className="sidebar-menu list-unstyled mt-3 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={handleLinkClick}
                className={`sidebar-link d-flex align-items-center ${
                  isActive(item.path) ? "active" : ""
                }`}
                style={{
                  // Styles simplified to rely on global CSS variables via .active class
                  textDecoration: "none",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  margin: "4px 6px",
                  transition: "all 0.3s ease",
                }}
              >
                <span className="me-3" style={{ fontSize: "1.1rem" }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="fw-medium sidebar-text">{item.text}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
 
        {/* Footer */}
        <div className="sidebar-footer mt-auto p-3 border-top">
          <button
            onClick={handleLogout}
            className="logout-btn w-100 fw-semibold"
            style={{
              // Styles simplified to rely on global CSS variables
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = theme === 'light' ? "#ffe082" : "#3c3c3c") // Retain hover logic with themes
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = theme === 'light' ? "#fff3e0" : "#2b2b2b") // Retain hover logic with themes
            }
          >
            <FaSignOutAlt className="me-2" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>
 
      {/* Overlay for Mobile */}
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => onToggle?.(false)}
          style={{
            position: "fixed",
            top: "56px",
            left: 0,
            width: "100%",
            height: "calc(100vh - 56px)",
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1030,
          }}
        />
      )}
    </>
  );
};
 
export default AdminSidebar;