const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { v4: uuidv4 } = require("uuid"); // Import UUID generator

// Register User (your existing code)
exports.registerUser = async (req, res) => {
  const { name, email, address, password, role } = req.body;
  const id = uuidv4();

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please enter all required fields: name, email, and password.",
    });
  }

  try {
    const existingUser = await query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User with that email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query(
      "INSERT INTO users (id, name, email, address, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, email, address || null, hashedPassword, role || "Normal User"]
    );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/// ... (rest of the file)

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

   

    try {
        // 1. Check if user exists
        const userResult = await query('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
        const user = userResult.rows[0];

        if (!user) {
            console.warn("Backend: User not found for email:", email); // Log if user email doesn't exist
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        

        // 2. Compare provided password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);

       

        if (!isMatch) {
            console.warn("Backend: Password mismatch for email:", email); // Log if password doesn't match
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful!', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        console.error('Login error in backend:', error); // Log the detailed error
        res.status(500).json({ message: 'Server error during login.' });
    }
};


// New: Update User Password
exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; 
   
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    

    try {
        // 1. Fetch user to verify current password
        const userResult = await query('SELECT password FROM users WHERE id = ?', [userId]);
        const user = userResult.rows[0];

        if (!user) {
           
            console.error("Backend: User not found for ID:", userId); // Log if user not found
            return res.status(404).json({ message: 'User not found.' }); // Should not happen with valid token
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          
            console.warn("Backend: Incorrect current password for userId:", userId); 
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        // 2. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // 3. Update password in database
       
        await query('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedNewPassword, userId]);

        res.status(200).json({ message: 'Password updated successfully!' });

    } catch (error) {
      
        console.error('Password update error in backend:', error); 
        res.status(500).json({ message: 'Server error updating password.' });
    }
};