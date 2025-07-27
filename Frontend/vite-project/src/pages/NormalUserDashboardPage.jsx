import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "../components/Dashboard/Dashboard.module.css";

function NormalUserDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleViewStores = () => {
    navigate("/stores");
  };

  return (
    <div className={styles.dashboardContainer}>
      <h2>Welcome, {user?.name}!</h2>
      <p>Role: {user?.role}</p>

      <div className={styles.dashboardActions}>
        <button onClick={handleViewStores} className={styles.actionButton}>
          View All Stores
        </button>
        <button className={styles.actionButton}>Update Password</button>
      </div>

      <button onClick={logout} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
}

export default NormalUserDashboardPage;
