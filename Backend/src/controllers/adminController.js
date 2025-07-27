// backend/src/controllers/adminController.js

const { query } = require("../config/db"); 
exports.getTotalUsersCount = async (req, res) => {
  try {
    const result = await query("SELECT COUNT(id) AS count FROM users");
    res.status(200).json({ count: result.rows[0].count });
  } catch (error) {
    console.error("Error fetching total users count:", error);
    res.status(500).json({ message: "Server error fetching user count." });
  }
};

exports.getTotalStoresCount = async (req, res) => {
  try {
    const result = await query("SELECT COUNT(id) AS count FROM stores");
    res.status(200).json({ count: result.rows[0].count });
  } catch (error) {
    console.error("Error fetching total stores count:", error);
    res.status(500).json({ message: "Server error fetching store count." });
  }
};

exports.getTotalRatingsCount = async (req, res) => {
  try {
    const result = await query("SELECT COUNT(id) AS count FROM ratings");
    res.status(200).json({ count: result.rows[0].count });
  } catch (error) {
    console.error("Error fetching total ratings count:", error);
    res.status(500).json({ message: "Server error fetching rating count." });
  }
};

// NEW FUNCTION: Admin: Get all stores (for management)
exports.getAllStores = async (req, res) => {
  const { name, address, sortBy, sortOrder = "ASC" } = req.query; // Filtering and sorting params

  let sql = `
        SELECT
            s.id,
            s.name,
            s.address,
            s.owner_id,
            COALESCE(AVG(r.rating), 0) AS average_rating  -- <<<--- CORRECTED THIS LINE
        FROM
            stores s
        LEFT JOIN
            ratings r ON s.id = r.store_id
        WHERE 1=1
    `;
  const params = [];

  if (name) {
    sql += ` AND s.name LIKE ?`;
    params.push(`%${name}%`);
  }
  if (address) {
    sql += ` AND s.address LIKE ?`;
    params.push(`%${address}%`);
  }

  sql += ` GROUP BY s.id, s.name, s.address, s.owner_id`; 

  // Sorting logic (ensure valid columns and order)
  if (sortBy) {
    const allowedSortColumns = ["name", "address", "average_rating"];
    if (allowedSortColumns.includes(sortBy)) {
      const order = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";
      sql += ` ORDER BY ${sortBy} ${order}`;
    }
  } else {
    sql += ` ORDER BY s.name ASC`; // Default sort
  }

  try {
    const result = await query(sql, params);
    console.log("Backend: Fetched stores for admin:", result.rows.length);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching stores for admin:", error);
    res.status(500).json({ message: "Server error fetching stores." });
  }
};
