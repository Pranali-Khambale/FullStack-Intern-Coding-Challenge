// backend/src/app.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); 
require("dotenv").config(); 


const { connectDB } = require("./config/db"); 

// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Your admin routes
const storeRoutes = require("./routes/storeRoutes"); 

const ratingRoutes = require("./routes/ratingRoutes"); 
const storeOwnerRoutes = require("./routes/storeOwnerRoutes"); 

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors()); 
app.use(bodyParser.json()); // To parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); 

// Route Middlewares
app.use("/api/auth", authRoutes); // ( login, register, update-password)
app.use("/api/admin", adminRoutes); //  ( /api/admin/stores, /api/admin/users)
app.use("/api/stores", storeRoutes); //  (/api/stores for normal users)
app.use("/api/ratings", ratingRoutes); // Rating routes
app.use("/api/store-owner", storeOwnerRoutes); 

// Basic route for testing server status
app.get("/", (req, res) => {
  res.send("API is running...");
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
