import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NormalUserDashboardPage from "./pages/NormalUserDashboardPage";
import StoreOwnerDashboardPage from "./pages/StoreOwnerDashboardPage";
import StoreListPage from "./pages/StoreListPage";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Common/Header"; 
import Footer from "./components/Common/Footer"; 

// PrivateRoute Component for protected routes
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Header /> {/* Add Header here */}
      <main
        style={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "20px 0",
        }}
      >
        {" "}
        {/* Main content area */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/stores" element={<StoreListPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                {user?.role === "System Administrator" && (
                  <Navigate to="/admin-dashboard" replace />
                )}
                {user?.role === "Normal User" && (
                  <Navigate to="/normal-dashboard" replace />
                )}
                {user?.role === "Store Owner" && (
                  <Navigate to="/store-owner-dashboard" replace />
                )}
                {!user && <Navigate to="/login" replace />}
              </PrivateRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={["System Administrator"]}>
                <AdminDashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/normal-dashboard"
            element={
              <PrivateRoute allowedRoles={["Normal User"]}>
                <NormalUserDashboardPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/store-owner-dashboard"
            element={
              <PrivateRoute allowedRoles={["Store Owner"]}>
                <StoreOwnerDashboardPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </main>
      <Footer /> {/* Add Footer here */}
    </Router>
  );
}

export default App;
