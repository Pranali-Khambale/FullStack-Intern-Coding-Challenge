// backend/src/routes/storeOwnerRoutes.js
const express = require("express");
const router = express.Router();
const storeOwnerController = require("../controllers/storeOwnerController"); 
const authMiddleware = require("../middlewares/authMiddleware"); 
const roleMiddleware = require("../middlewares/roleMiddleware"); 

// Middleware to ensure only Store Owners can access these routes
router.use(authMiddleware);
router.use(roleMiddleware(["Store Owner"])); 

// Route to get store owner dashboard data
router.get("/dashboard", storeOwnerController.getStoreOwnerDashboardData);

module.exports = router;
