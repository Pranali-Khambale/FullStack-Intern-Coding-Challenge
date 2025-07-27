// backend/src/controllers/storeOwnerController.js
const { query } = require("../config/db"); 

exports.getStoreOwnerDashboardData = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const storesOfOwnerResult = await query(
      "SELECT id, name FROM stores WHERE owner_id = ?",
      [ownerId]
    );
    const ownedStores = storesOfOwnerResult.rows;

    if (ownedStores.length === 0) {
      
      return res
        .status(404)
        .json({ message: "No stores found for this owner." });
    }

    const storeIds = ownedStores.map((store) => store.id);

    let ratingsAndUsersSql = `
            SELECT
                r.id AS rating_id,
                r.rating AS rating_value,
                r.comment,
                r.created_at,
                u.id AS user_id,
                u.name AS user_name,
                u.email AS user_email,
                s.name AS store_name,
                s.id AS store_id
            FROM
                ratings r
            JOIN
                users u ON r.user_id = u.id
            JOIN
                stores s ON r.store_id = s.id
            WHERE r.store_id IN (${storeIds.map(() => "?").join(",")})
            ORDER BY r.created_at DESC
        `;
    const ratingsAndUsersResult = await query(ratingsAndUsersSql, storeIds);
    const allRatingsDataForOwnedStores = ratingsAndUsersResult.rows; // Renamed for clarity

    const averageRatingsPerStore = {};
    for (const store of ownedStores) {
      const ratingsForThisStore = allRatingsDataForOwnedStores.filter(
        
        (r) => r.store_id === store.id
      );
      const totalRating = ratingsForThisStore.reduce(
        (sum, r) => sum + r.rating_value,
        0
      );
      averageRatingsPerStore[store.id] =
        ratingsForThisStore.length > 0
          ? totalRating / ratingsForThisStore.length
          : 0;
    }

    // Determine the average rating for the primary store to send to the frontend
    
    const primaryOwnedStoreId = ownedStores[0].id;
    const averageRatingForPrimaryStore =
      averageRatingsPerStore[primaryOwnedStoreId] || 0;

    // Filter ratings to only include those for the primary store for the frontend display
    const ratingsForPrimaryStore = allRatingsDataForOwnedStores.filter(
      (r) => r.store_id === primaryOwnedStoreId
    );

    console.log(
      "Backend: Fetched store owner dashboard data for owner:",
      ownerId
    );

    // This is the crucial part: Aligning backend keys with frontend expectations
    res.status(200).json({
      ownerId: ownerId,
      ownedStores: ownedStores, 
      ratings: ratingsForPrimaryStore, 
      averageRating: averageRatingForPrimaryStore, 
    });
  } catch (error) {
    console.error("Error fetching store owner dashboard data:", error);
    res
      .status(500)
      .json({ message: "Server error fetching store owner data." });
  }
};
