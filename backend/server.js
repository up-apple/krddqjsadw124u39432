const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Assuming cryptoUtils.js is in the same directory
const { hashPassword, verifyPassword, deriveKeyFromPassword, encryptKeychainItem, decryptKeychainItem } = require('./cryptoUtils.js');

// --- Configuration ---
const PORT = 3001;
const NAS_DATA_PATH = '/mnt/nas_data/files'; // Directory for LUKS mounted drive
// IMPORTANT: Store secrets in environment variables, not in code!
const JWT_SECRET = 'your-super-secret-and-long-jwt-secret-key'; 

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
app.post('/api/auth/login', loginRateLimiter, (req, res) => {
  // In a real implementation:
  // 1. const { username, password } = req.body;
  // 2. Fetch user from database by username.
  // 3. const isValid = await verifyPassword(user.passwordHash, password);
  // 4. If valid, create JWT.
  
  // For now, just returning a dummy token for a test user.
  const token = jwt.sign(
    { userId: 'test-user-id', email: 'test@example.com' },
    JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );

  res.status(200).json({
    message: 'Login successful (simulation)',
    token: token
  });
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
