// backend/src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController"); 
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Middleware to ensure only System Administrators can access these routes
router.use(authMiddleware);
router.use(roleMiddleware(["System Administrator"]));

// Admin: Add a new user (with role selection)
router.post("/users", userController.addUserByAdmin);

// Admin: Get all users (for management)
router.get("/users", userController.getAllUsers);

// Admin: Update a user's role or details
router.put("/users/:id", userController.updateUserByAdmin);

// Admin: Delete a user
router.delete("/users/:id", userController.deleteUserByAdmin);

// Admin Dashboard Summary Counts
router.get("/users/count", adminController.getTotalUsersCount);
router.get("/stores/count", adminController.getTotalStoresCount);
router.get("/ratings/count", adminController.getTotalRatingsCount);

// NEW ROUTE: Admin: Get all stores (for management)
router.get("/stores", adminController.getAllStores); 

module.exports = router;
