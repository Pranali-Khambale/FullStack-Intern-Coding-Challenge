import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import styles from "../components/Stores/Stores.module.css";

function StoreListPage() {
  const { isAuthenticated, user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("http://localhost:5000/api/stores", {
          params: { name: searchName, address: searchAddress },
        });
        setStores(response.data);
      } catch (err) {
        setError("Failed to fetch stores.");
        console.error("Error fetching stores:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [searchName, searchAddress]);

  const handleSubmitRating = async (storeId, rating) => {
    if (!isAuthenticated || user.role !== "Normal User") {
      alert("You must be logged in as a Normal User to submit ratings.");
      return;
    }
    if (rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/stores/${storeId}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rating submitted successfully!");
      setSearchName(searchName + " "); // Trick to re-run useEffect
    } catch (err) {
      alert(
        "Failed to submit rating. You might have already rated this store or an error occurred."
      );
      console.error(
        "Error submitting rating:",
        err.response?.data || err.message
      );
    }
  };

  const handleModifyRating = async (storeId, newRating) => {
    if (!isAuthenticated || user.role !== "Normal User") {
      alert("You must be logged in as a Normal User to modify ratings.");
      return;
    }
    if (newRating < 1 || newRating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/stores/${storeId}/rate`,
        { rating: newRating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rating modified successfully!");
      setSearchName(searchName + " "); // Trick to re-run useEffect
    } catch (err) {
      alert("Failed to modify rating. An error occurred.");
      console.error(
        "Error modifying rating:",
        err.response?.data || err.message
      );
    }
  };

  if (loading) return <div className={styles.loading}>Loading stores...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.storeListContainer}>
      <h2>All Registered Stores</h2>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.searchInput}
        />
        <input
          type="text"
          placeholder="Search by address..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      {stores.length === 0 ? (
        <p>No stores found.</p>
      ) : (
        <ul className={styles.storeList}>
          {stores.map((store) => (
            <li key={store.id} className={styles.storeItem}>
              <h3>{store.name}</h3>
              <p>Address: {store.address}</p>
              <p>
                Overall Rating:{" "}
                {store.average_rating !== null &&
                store.average_rating !== undefined
                  ? parseFloat(store.average_rating).toFixed(1)
                  : "N/A"}
              </p>
              {isAuthenticated && user.role === "Normal User" && (
                <div className={styles.ratingSection}>
                  <p>
                    Your Submitted Rating:{" "}
                    {store.user_rating || "Not yet rated"}
                  </p>
                  <select
                    value={store.user_rating || ""}
                    onChange={(e) => {
                      const newRating = parseInt(e.target.value);
                      if (store.user_rating) {
                        handleModifyRating(store.id, newRating);
                      } else {
                        handleSubmitRating(store.id, newRating);
                      }
                    }}
                    className={styles.ratingSelect}
                  >
                    <option value="">Rate...</option>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r} Star{r > 1 && "s"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StoreListPage;
