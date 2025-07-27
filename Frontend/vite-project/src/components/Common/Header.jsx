// frontend/src/components/Common/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Common.module.css";  

function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <Link to="/" className={styles.brandLink}>
            Store Rating App
          </Link>
        </div>
        <ul className={styles.navbarNav}>
          {!isAuthenticated ? (
            <>
              <li className={styles.navItem}>
                <Link to="/login" className={styles.navLink}>
                  Login
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link to="/register" className={styles.navLink}>
                  Register
                </Link>
              </li>
            </>
          ) : (
            <>
              {user?.role === "System Administrator" && (
                <li className={styles.navItem}>
                  <Link to="/admin-dashboard" className={styles.navLink}>
                    Admin Dashboard
                  </Link>
                </li>
              )}
              {user?.role === "Normal User" && (
                <li className={styles.navItem}>
                  <Link to="/normal-dashboard" className={styles.navLink}>
                    User Dashboard
                  </Link>
                </li>
              )}
              {user?.role === "Store Owner" && (
                <li className={styles.navItem}>
                  <Link to="/store-owner-dashboard" className={styles.navLink}>
                    Owner Dashboard
                  </Link>
                </li>
              )}
              {/* Common links for logged-in users */}
              <li className={styles.navItem}>
                <Link to="/stores" className={styles.navLink}>
                  View Stores
                </Link>
              </li>
              <li className={styles.navItem}>
                <span className={styles.welcomeText}>
                  Welcome, {user?.name || user?.email}!
                </span>
              </li>
              <li className={styles.navItem}>
                <button onClick={logout} className={styles.logoutButton}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
