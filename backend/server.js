const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Assuming cryptoUtils.js is in the same directory
const { verifyPassword, deriveKeyFromPassword } = require('./cryptoUtils.js');

// --- Configuration ---
const PORT = 3001;
const NAS_DATA_PATH = '/mnt/nas_data/files'; // Directory for LUKS mounted drive
// IMPORTANT: Store secrets in environment variables, not in code!
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-and-long-jwt-secret-key-for-dev'; 

// --- In-memory user simulation (for demonstration purposes) ---
const activeSessions = new Map();
const testUser = {
  username: 'admin',
  userId: 'admin-001',
  passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$QiylJjlvX2v7N/HVCPrJqg$tAVxC8NSZoYuo/wcxPWz0BLJSkDNoDZ8rxoyD4yRZoc',
  salt: Buffer.from('mi-salt-secreto-unico', 'utf-8')
};


// --- Express App Setup ---
const app = express();

// --- Security Middleware ---
app.use(helmet()); // Sets various security-related HTTP headers

// CORS configuration to allow requests only from the frontend app
const corsOptions = {
  origin: 'http://localhost:5173'
};
app.use(cors(corsOptions));

// JSON body parser
app.use(express.json());

// --- Rate Limiting for Login ---
const loginRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again after a minute',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// --- Authentication Middleware ---
const checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided.' });
    }
    
    // In a real app, you'd want to check for token revocation here
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.userData = { userId: decodedToken.userId }; // Add user data to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
  }
};

// --- API Routes ---

// POST /api/auth/login - Authenticate user and return JWT
app.post('/api/auth/login', loginRateLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (username !== testUser.username) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }

  try {
    const isValid = await verifyPassword(testUser.passwordHash, password);

    if (!isValid) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    // Derive AES key from password and salt
    const derivedKey = await deriveKeyFromPassword(password, testUser.salt);

    // Store the derived key in our "session" map
    activeSessions.set(testUser.userId, derivedKey);

    // Generate JWT
    const token = jwt.sign(
      { userId: testUser.userId, username: testUser.username },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return token and user info (excluding sensitive data)
    res.status(200).json({
      token,
      userId: testUser.userId
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An internal error occurred during login.' });
  }
});

// GET /api/files - Get list of files from the secure directory
app.get('/api/files', checkAuth, (req, res) => {
  fs.readdir(NAS_DATA_PATH, (err, files) => {
    if (err) {
      // Log the error for debugging, but don't expose details to the client
      console.error(`Error reading directory ${NAS_DATA_PATH}:`, err);
      // Check for specific, common errors
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'Secure data directory not found on server.' });
      }
      return res.status(500).json({ message: 'Error accessing files.' });
    }
    
    // Optionally, you might want to filter or format the file list
    res.status(200).json({
      message: 'Files retrieved successfully',
      files: files
    });
  });
});

// POST /api/keychain - Receive keychain data
app.post('/api/keychain', checkAuth, (req, res) => {
  const { keychainData } = req.body;

  if (!keychainData) {
    return res.status(400).json({ message: 'No keychain data provided.' });
  }

  // In a real implementation:
  // 1. Get the user's derived key (which should be in memory for the session).
  // 2. Encrypt and store the keychainData securely.
  
  console.log('Received keychain data (simulation):', keychainData);

  res.status(200).json({ message: 'Keychain data received successfully (simulation).' });
});


// --- Server Initialization ---
app.listen(PORT, () => {
  console.log(`Secure server running on http://localhost:${PORT}`);
});
