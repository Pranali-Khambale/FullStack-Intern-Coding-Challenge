import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../components/Dashboard/Dashboard.module.css";
import axios from "axios";

// Component for adding a new user 
function AddUserForm({ onUserAdded }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "Normal User", // Default role 
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/admin/users",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
      setFormData({
        // Reset form
        name: "",
        email: "",
        address: "",
        password: "",
        role: "Normal User",
      });
      if (onUserAdded) {
        onUserAdded(); // Callback to refresh user list in parent component
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user.");
      console.error("Add user error:", err.response?.data || err.message);
    }
  };

  return (
    <div className={styles.formSection}>
      <h3>Add New User</h3>
      <form onSubmit={handleSubmit} className={styles.adminForm}>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className={styles.selectField}
          >
            <option value="Normal User">Normal User</option>
            <option value="Store Owner">Store Owner</option>
            <option value="System Administrator">System Administrator</option>
          </select>
        </div>
        <button type="submit" className={styles.submitButton}>
          Add User
        </button>
        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
}

// Component for adding a new store
function AddStoreForm({ onStoreAdded }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    store_owner_id: "", 
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [storeOwners, setStoreOwners] = useState([]); // To populate the dropdown

  useEffect(() => {
    const fetchStoreOwners = async () => {
      try {
        const token = localStorage.getItem("token");
        // Fetch users who are 'Store Owner' to populate the dropdown
        const response = await axios.get(
          "http://localhost:5000/api/admin/users?role=Store Owner",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStoreOwners(response.data);
      } catch (err) {
        console.error("Error fetching store owners:", err);
      }
    };
    // Only fetch if authenticated and is an admin
    if (user && user.role === "System Administrator") {
      fetchStoreOwners();
    }
  }, [user]); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/stores", // Admin adds stores via /api/stores
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
      setFormData({
        // Reset form
        name: "",
        address: "",
        store_owner_id: "",
      });
      if (onStoreAdded) {
        onStoreAdded(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add store.");
      console.error("Add store error:", err.response?.data || err.message);
    }
  };

  return (
    <div className={styles.formSection}>
      <h3>Add New Store</h3>
      <form onSubmit={handleSubmit} className={styles.adminForm}>
        <div className={styles.formGroup}>
          <label>Store Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className={styles.inputField}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Store Owner (Optional):</label>
          <select
            name="store_owner_id"
            value={formData.store_owner_id}
            onChange={handleChange}
            className={styles.selectField}
          >
            <option value="">-- Select Owner --</option>{" "}
            
            {storeOwners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.submitButton}>
          Add Store
        </button>
        {message && <p className={styles.successMessage}>{message}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
    </div>
  );
}



// Password Update Form
function PasswordUpdateForm() { 
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    
    try {
      const token = localStorage.getItem("token");
      console.log("Using token:", token);

      const response = await axios.put(
        "http://localhost:5000/api/auth/profile/update-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
      console.error(
        "Password update error in frontend:",
        err.response?.data || err.message
      );
    }
  };

  return ( 
    <form onSubmit={handleSubmit} className={styles.adminForm}>
      <div className={styles.formGroup}>
        <label>Current Password:</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className={styles.inputField}
        />
      </div>
      <div className={styles.formGroup}>
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className={styles.inputField}
        />
      </div>
      <button type="submit" className={styles.submitButton}>
        Update Password
      </button>
      {message && <p className={styles.successMessage}>{message}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </form>
  );
} 

// Main Admin Dashboard Page Component
function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtering and Sorting states for Users
  const [userFilterName, setUserFilterName] = useState("");
  const [userFilterEmail, setUserFilterEmail] = useState("");
  const [userFilterAddress, setUserFilterAddress] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("");
  const [userSortBy, setUserSortBy] = useState("name");
  const [userSortOrder, setUserSortOrder] = useState("ASC");

  // Filtering and Sorting states for Stores
  const [storeFilterName, setStoreFilterName] = useState("");
  const [storeFilterAddress, setStoreFilterAddress] = useState("");
  const [storeSortBy, setStoreSortBy] = useState("name");
  const [storeSortOrder, setStoreSortOrder] = useState("ASC");

  // State for Edit User Modal (simplified for now)
  const [editingUser, setEditingUser] = useState(null);
  const [editUserFormData, setEditUserFormData] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
    newPassword: "",
  });
  const [editUserMessage, setEditUserMessage] = useState("");
  const [editUserError, setEditUserError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [usersRes, storesRes, ratingsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/users/count", config),
        axios.get("http://localhost:5000/api/admin/stores/count", config),
        axios.get("http://localhost:5000/api/admin/ratings/count", config),
      ]);

      setDashboardData({
        totalUsers: usersRes.data.count,
        totalStores: storesRes.data.count,
        totalRatings: ratingsRes.data.count,
      });
    } catch (err) {
      setError("Failed to fetch dashboard summary.");
      console.error(
        "Error fetching admin summary:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          name: userFilterName,
          email: userFilterEmail,
          address: userFilterAddress,
          role: userFilterRole,
          sortBy: userSortBy,
          sortOrder: userSortOrder,
        },
      };
      const response = await axios.get(
        "http://localhost:5000/api/admin/users",
        config
      );
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users.");
      console.error("Error fetching users:", err.response?.data || err.message);
    }
  };

  const fetchStores = async () => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          name: storeFilterName,
          address: storeFilterAddress,
          sortBy: storeSortBy,
          sortOrder: storeSortOrder,
        },
      };
      const response = await axios.get(
        "http://localhost:5000/api/admin/stores",
        config
      ); // Assuming admin can get all stores
      setStores(response.data);
    } catch (err) {
      setError("Failed to fetch stores.");
      console.error(
        "Error fetching stores:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    if (user && user.role === "System Administrator") {
      fetchDashboardData();
      fetchUsers();
      fetchStores();
    }
  }, [
    user,
    userFilterName,
    userFilterEmail,
    userFilterAddress,
    userFilterRole,
    userSortBy,
    userSortOrder,
    storeFilterName,
    storeFilterAddress,
    storeSortBy,
    storeSortOrder,
  ]); // Re-fetch on filter/sort changes

  const handleUserAdded = () => {
    fetchDashboardData(); // Refresh counts
    fetchUsers(); // Refresh user list
  };

  const handleStoreAdded = () => {
    fetchDashboardData(); // Refresh counts
    fetchStores(); // Refresh store list
  };

  const handleDeleteUser = async (userIdToDelete) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/admin/users/${userIdToDelete}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("User deleted successfully!");
        handleUserAdded(); // Refresh lists
      } catch (err) {
        alert("Failed to delete user.");
        console.error("Delete user error:", err.response?.data || err.message);
      }
    }
  };

  const handleEditUserClick = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditUserFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      address: userToEdit.address,
      role: userToEdit.role,
      newPassword: "", // Don't pre-fill password for security
    });
    setEditUserMessage("");
    setEditUserError("");
  };

  const handleEditUserChange = (e) => {
    setEditUserFormData({
      ...editUserFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    setEditUserMessage("");
    setEditUserError("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/users/${editingUser.id}`,
        editUserFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditUserMessage("User updated successfully!");
      setEditingUser(null); // Close modal
      handleUserAdded(); // Refresh user list
    } catch (err) {
      setEditUserError(err.response?.data?.message || "Failed to update user.");
      console.error("Update user error:", err.response?.data || err.message);
    }
  };

  if (loading)
    return <div className={styles.loading}>Loading admin dashboard...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      <h2>Welcome, Admin {user?.name}!</h2>
      <p>Role: {user?.role}</p>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Total Users</h3>
          <p>{dashboardData.totalUsers}</p>
        </div>
        <div className={styles.card}>
          <h3>Total Stores</h3>
          <p>{dashboardData.totalStores}</p>
        </div>
        <div className={styles.card}>
          <h3>Total Ratings</h3>
          <p>{dashboardData.totalRatings}</p>
        </div>
      </div>

      {/* Add New User Section */}
      <AddUserForm onUserAdded={handleUserAdded} />

      {/* Add New Store Section */}
      <AddStoreForm onStoreAdded={handleStoreAdded} />

      {/* Manage Users Section */}
      <div className={styles.section}>
        <h3>Manage Users</h3>
        <div className={styles.filterSortContainer}>
          <input
            type="text"
            placeholder="Filter by Name"
            value={userFilterName}
            onChange={(e) => setUserFilterName(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="text"
            placeholder="Filter by Email"
            value={userFilterEmail}
            onChange={(e) => setUserFilterEmail(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="text"
            placeholder="Filter by Address"
            value={userFilterAddress}
            onChange={(e) => setUserFilterAddress(e.target.value)}
            className={styles.filterInput}
          />
          <select
            value={userFilterRole}
            onChange={(e) => setUserFilterRole(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Roles</option>
            <option value="System Administrator">System Administrator</option>
            <option value="Normal User">Normal User</option>
            <option value="Store Owner">Store Owner</option>
          </select>
          <select
            value={userSortBy}
            onChange={(e) => setUserSortBy(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
            <option value="average_store_rating">
              Sort by Store Avg Rating
            </option>
          </select>
          <select
            value={userSortOrder}
            onChange={(e) => setUserSortOrder(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
              <th>Store Avg Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
                <td>
                  {u.role === "Store Owner" &&
                  u.average_store_rating !== null &&
                  u.average_store_rating !== undefined
                    ? parseFloat(u.average_store_rating).toFixed(1)
                    : "N/A"}
                </td>
                <td>
                  <button
                    onClick={() => handleEditUserClick(u)}
                    className={styles.actionButtonSmall}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className={styles.actionButtonSmallDanger}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal/Form  */}
      {editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit User: {editingUser.name}</h3>
            <form
              onSubmit={handleUpdateUserSubmit}
              className={styles.adminForm}
            >
              <div className={styles.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editUserFormData.name}
                  onChange={handleEditUserChange}
                  required
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editUserFormData.email}
                  onChange={handleEditUserChange}
                  required
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Address:</label>
                <input
                  type="text"
                  name="address"
                  value={editUserFormData.address}
                  onChange={handleEditUserChange}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role:</label>
                <select
                  name="role"
                  value={editUserFormData.role}
                  onChange={handleEditUserChange}
                  required
                  className={styles.selectField}
                >
                  <option value="Normal User">Normal User</option>
                  <option value="Store Owner">Store Owner</option>
                  <option value="System Administrator">
                    System Administrator
                  </option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>New Password (optional):</label>
                <input
                  type="password"
                  name="newPassword"
                  value={editUserFormData.newPassword}
                  onChange={handleEditUserChange}
                  placeholder="Leave blank to keep current"
                  className={styles.inputField}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.submitButton}>
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
              {editUserMessage && (
                <p className={styles.successMessage}>{editUserMessage}</p>
              )}
              {editUserError && (
                <p className={styles.errorMessage}>{editUserError}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Manage Stores Section (Admin can view all stores) */}
      <div className={styles.section}>
        <h3>Manage Stores</h3>
        <div className={styles.filterSortContainer}>
          <input
            type="text"
            placeholder="Filter by Name"
            value={storeFilterName}
            onChange={(e) => setStoreFilterName(e.target.value)}
            className={styles.filterInput}
          />
          <input
            type="text"
            placeholder="Filter by Address"
            value={storeFilterAddress}
            onChange={(e) => setStoreFilterAddress(e.target.value)}
            className={styles.filterInput}
          />
          <select
            value={storeSortBy}
            onChange={(e) => setStoreSortBy(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="name">Sort by Name</option>
            <option value="address">Sort by Address</option>
            <option value="average_rating">Sort by Avg Rating</option>
          </select>
          <select
            value={storeSortOrder}
            onChange={(e) => setStoreSortOrder(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Owner ID</th>
              <th>Avg Rating</th>
              {/* Add actions like Edit/Delete Store if needed */}
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.address}</td>
                <td>{s.owner_id || "N/A"}</td>
                <td>
                  {s.average_rating !== null && s.average_rating !== undefined
                    ? parseFloat(s.average_rating).toFixed(1)
                    : "N/A"}
                </td>
                {/* Add buttons for edit/delete store here */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Update Section  */}
      <div className={styles.section}>
        <h3>Update Your Password</h3>
        <PasswordUpdateForm />
      </div>

      <button onClick={logout} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
}

export default AdminDashboardPage;
