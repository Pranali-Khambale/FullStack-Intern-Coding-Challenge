const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware"); 

// User registration route
router.post("/register", authController.registerUser);

// User login route
router.post("/login", authController.loginUser);

router.put(
  "/profile/update-password",
  authMiddleware,
  authController.updatePassword
);

module.exports = router;
