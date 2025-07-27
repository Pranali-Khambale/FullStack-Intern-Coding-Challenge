// frontend/src/pages/StoreOwnerDashboardPage.jsx 
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../components/Dashboard/Dashboard.module.css";
import axios from "axios";

function StoreOwnerDashboardPage() {
  const { user, logout } = useAuth();
  const [storeRatings, setStoreRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "http://localhost:5000/api/store-owner/dashboard",
          config
        );

        // These lines now correctly match the backend's new response keys
        setStoreRatings(response.data.ratings);
        setAverageRating(response.data.averageRating);
      } catch (err) {
        setError("Failed to fetch store owner data.");
        console.error(
          "Error fetching store owner data:",
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "Store Owner") {
      fetchStoreData();
    }
  }, [user]);

  if (loading)
    return (
      <div className={styles.loading}>Loading store owner dashboard...</div>
    );
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      <h2>Welcome, Store Owner {user?.name}!</h2>
      <p>Role: {user?.role}</p>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Your Store's Average Rating</h3>
          
          <p>
            {typeof averageRating === "number"
              ? averageRating.toFixed(1)
              : "N/A"}{" "}
            / 5
          </p>
        </div>
      </div>

      <h3>Ratings for Your Store</h3>
      
      {storeRatings.length === 0 ? (
        <p>No ratings submitted for your store yet.</p>
      ) : (
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {storeRatings.map((rating) => (
              <tr key={rating.id}>
                <td>{rating.userName}</td>
                <td>{rating.rating}</td>
                <td>{rating.comment || "N/A"}</td>
                <td>{new Date(rating.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={logout} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
}

export default StoreOwnerDashboardPage;
