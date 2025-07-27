// backend/src/controllers/userController.js
const { query } = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const validateForm = require("../utils/validation"); 

// Admin: Add a new user (with role selection)
exports.addUserByAdmin = async (req, res) => {
  const { name, email, address, password, role } = req.body;
  const id = uuidv4();

  // Basic validation (more robust validation can be added here or in a service layer)
  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Name, email, password, and role are required." });
  }
  if (!["System Administrator", "Normal User", "Store Owner"].includes(role)) {
    return res.status(400).json({ message: "Invalid role specified." });
  }

  // Apply validations from utils
  const validationErrors = {};
  if (!validateForm.validateName(name))
    validationErrors.name = "Name must be between 20-60 characters.";
  if (!validateForm.validateEmail(email))
    validationErrors.email = "Invalid email format.";
  if (!validateForm.validateAddress(address))
    validationErrors.address = "Address cannot exceed 400 characters.";
  if (!validateForm.validatePassword(password))
    validationErrors.password =
      "Password must be 8-16 chars, incl. uppercase and special character.";

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query(
      "INSERT INTO users (id, name, email, address, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, email, address, hashedPassword, role]
    );

    res
      .status(201)
      .json({
        message: "User created successfully by admin.",
        user: { id, name, email, role },
      });
  } catch (error) {
    console.error("Admin add user error:", error);
    res.status(500).json({ message: "Server error adding user." });
  }
};

// Admin: Get all users (with optional sorting/filtering)
exports.getAllUsers = async (req, res) => {
  const { name, email, address, role, sortBy, sortOrder = "ASC" } = req.query; // Filtering and sorting params

  let sql = `
        SELECT
            u.id,
            u.name,
            u.email,
            u.address,
            u.role,
            CASE
                WHEN u.role = 'Store Owner' THEN COALESCE(AVG(r.rating), 0)
                ELSE NULL
            END AS average_store_rating
        FROM
            users u
        LEFT JOIN
            stores s ON u.id = s.owner_id
        LEFT JOIN
            ratings r ON s.id = r.store_id
        WHERE 1=1
    `;
  const params = [];

  if (name) {
    sql += ` AND u.name LIKE ?`;
    params.push(`%${name}%`);
  }
  if (email) {
    sql += ` AND u.email LIKE ?`;
    params.push(`%${email}%`);
  }
  if (address) {
    sql += ` AND u.address LIKE ?`;
    params.push(`%${address}%`);
  }
  if (role) {
    sql += ` AND u.role = ?`;
    params.push(role);
  }

  sql += ` GROUP BY u.id, u.name, u.email, u.address, u.role`; 
  
  if (sortBy) {
    const allowedSortColumns = [
      "name",
      "email",
      "address",
      "role",
      "average_store_rating",
    ];
    if (allowedSortColumns.includes(sortBy)) {
      const order = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";
      sql += ` ORDER BY ${sortBy} ${order}`;
    }
  } else {
    sql += ` ORDER BY u.name ASC`; 
  }

  try {
    const result = await query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Admin get all users error:", error);
    res.status(500).json({ message: "Server error fetching users." });
  }
};

// Admin: Update a user's role or details
exports.updateUserByAdmin = async (req, res) => {
  const { id } = req.params; 
  const { name, email, address, role, password } = req.body; 

  const updates = [];
  const params = [];

  if (name) {
    updates.push("name = ?");
    params.push(name);
  }
  if (email) {
    updates.push("email = ?");
    params.push(email);
  }
  if (address) {
    updates.push("address = ?");
    params.push(address);
  }
  if (role) {
    if (
      !["System Administrator", "Normal User", "Store Owner"].includes(role)
    ) {
      return res.status(400).json({ message: "Invalid role specified." });
    }
    updates.push("role = ?");
    params.push(role);
  }
  if (password) {
    // Hash new password if provided
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    updates.push("password = ?");
    params.push(hashedPassword);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields provided for update." });
  }

  params.push(id); // Add user ID for WHERE clause

  try {
    await query(
      `UPDATE users SET ${updates.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );
    res.status(200).json({ message: "User updated successfully by admin." });
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ message: "Server error updating user." });
  }
};

// Admin: Delete a user
exports.deleteUserByAdmin = async (req, res) => {
  const { id } = req.params; 

  try {
    await query("DELETE FROM users WHERE id = ?", [id]);
    res.status(200).json({ message: "User deleted successfully by admin." });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Server error deleting user." });
  }
};
