const mysql = require("mysql2/promise"); // Import mysql2/promise

let connection;

const connectDB = async () => {
  try {
    // Create the MySQL connection
    connection = await mysql.createConnection({
      
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("MySQL connected...");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1); 
  }
};

const query = async (text, params) => {
  
  if (!connection) {
    
    throw new Error("Database connection not established before query.");
  }
  try {
    
    const [rows] = await connection.execute(text, params);
    return { rows }; 
  } catch (error) {
    console.error("Database query error:", error);
    throw error; 
  }
};

// Export both functions
module.exports = { connectDB, query };
