import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../components/Auth/Auth.module.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);
    if (result.success) {
      if (user?.role === "System Administrator") {
        navigate("/admin-dashboard");
      } else if (user?.role === "Normal User") {
        navigate("/normal-dashboard");
      } else if (user?.role === "Store Owner") {
        navigate("/store-owner-dashboard");
      } else {
        navigate("/");
      }
    } else {
      setError(
        result.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className={styles.authContainer}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <h2>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.inputField}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
        <p className={styles.switchForm}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
