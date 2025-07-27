const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const authMiddleware = require("../middlewares/authMiddleware"); 

// Admin only: Add a new store
router.post("/", authMiddleware, storeController.addStore);

// Public/Authenticated: Get all stores (with optional search)
router.get("/", storeController.getStores);

// Authenticated: Submit a rating for a store (Normal User)
router.post("/:id/rate", authMiddleware, storeController.submitRating);

// Authenticated: Modify a rating for a store (Normal User)
router.put("/:id/rate", authMiddleware, storeController.modifyRating);

module.exports = router;
