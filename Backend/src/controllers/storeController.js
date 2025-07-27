const { query } = require("../config/db");
const { v4: uuidv4 } = require("uuid"); // Import UUID generator

// System Administrator only: Add a new store
exports.addStore = async (req, res) => {
  
  if (req.user.role !== "System Administrator") {
    return res
      .status(403)
      .json({ message: "Access denied. Only administrators can add stores." });
  }

  const { name, address, store_owner_id } = req.body;
  const id = uuidv4(); // Generate UUID for the new store

  if (!name || !address) {
    return res
      .status(400)
      .json({ message: "Store name and address are required." });
  }

  try {
    // Optional: Validate if store_owner_id exists and has 'Store Owner' role
    if (store_owner_id) {
      const ownerCheck = await query(
        'SELECT id FROM users WHERE id = ? AND role = "Store Owner"',
        [store_owner_id]
      );
      if (ownerCheck.rows.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid or non-existent Store Owner ID." });
      }
    }

    const result = await query(
      "INSERT INTO stores (id, name, address, store_owner_id) VALUES (?, ?, ?, ?)",
      [id, name, address, store_owner_id || null]
    );
    res
      .status(201)
      .json({
        message: "Store added successfully",
        store: { id, name, address, store_owner_id },
      });
  } catch (error) {
    console.error("Error adding store:", error);
    res.status(500).json({ message: "Server error adding store." });
  }
};

// Get all stores (publicly accessible, or for Normal User with search)
exports.getStores = async (req, res) => {
  const { name, address } = req.query; 

  let sql = `
        SELECT
            s.id,
            s.name,
            s.address,
            s.store_owner_id,
            COALESCE(AVG(r.rating), 0) AS average_rating,
            (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) AS user_rating -- User's specific rating
        FROM
            stores s
        LEFT JOIN
            ratings r ON s.id = r.store_id
        WHERE 1=1
    `;
  const params = [];

  // Add search filters
  if (name) {
    sql += ` AND s.name LIKE ?`;
    params.push(`%${name}%`);
  }
  if (address) {
    sql += ` AND s.address LIKE ?`;
    params.push(`%${address}%`);
  }

  sql += ` GROUP BY s.id ORDER BY s.name`; // Group by store and order

  // Handle user_id for the subquery if authenticated
  let userId = null;
  if (req.user && req.user.id) {
    // Check if user is authenticated and ID is available
    userId = req.user.id;
  }
  params.unshift(userId); // Add userId to the beginning of params for the subquery

  try {
    const result = await query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Server error fetching stores." });
  }
};

// Normal User only: Submit a rating for a store
exports.submitRating = async (req, res) => {
  if (req.user.role !== "Normal User") {
    return res
      .status(403)
      .json({
        message: "Access denied. Only Normal Users can submit ratings.",
      });
  }

  const { id: storeId } = req.params; // Store ID from URL
  const { rating, comment } = req.body;
  const userId = req.user.id; // User ID from authenticated token
  const ratingId = uuidv4(); // Generate UUID for the new rating

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    // Check if user has already rated this store
    const existingRating = await query(
      "SELECT id FROM ratings WHERE store_id = ? AND user_id = ?",
      [storeId, userId]
    );
    if (existingRating.rows.length > 0) {
      return res
        .status(409)
        .json({
          message:
            "You have already submitted a rating for this store. Please modify it instead.",
        });
    }

    await query(
      "INSERT INTO ratings (id, store_id, user_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [ratingId, storeId, userId, rating, comment || null]
    );
    res.status(201).json({ message: "Rating submitted successfully." });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Server error submitting rating." });
  }
};

// Normal User only: Modify an existing rating for a store
exports.modifyRating = async (req, res) => {
  if (req.user.role !== "Normal User") {
    return res
      .status(403)
      .json({
        message: "Access denied. Only Normal Users can modify ratings.",
      });
  }

  const { id: storeId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  try {
    // Check if a rating by this user for this store exists
    const existingRating = await query(
      "SELECT id FROM ratings WHERE store_id = ? AND user_id = ?",
      [storeId, userId]
    );
    if (existingRating.rows.length === 0) {
      return res
        .status(404)
        .json({
          message: "No existing rating found for this store by this user.",
        });
    }

    await query(
      "UPDATE ratings SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE store_id = ? AND user_id = ?",
      [rating, comment || null, storeId, userId]
    );
    res.status(200).json({ message: "Rating modified successfully." });
  } catch (error) {
    console.error("Error modifying rating:", error);
    res.status(500).json({ message: "Server error modifying rating." });
  }
};
