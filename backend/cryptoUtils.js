const crypto = require('crypto');
const argon2 = require('argon2');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Hashes a password using Argon2.
 * @param {string} password The password to hash.
 * @returns {Promise<string>} The hashed password.
 */
async function hashPassword(password) {
  try {
    return await argon2.hash(password);
  } catch (err) {
    // It is recommended to log errors on the server.
    console.error('Error hashing password:', err);
    throw new Error('Could not hash password.');
  }
}

/**
 * Verifies a password against a hash.
 * @param {string} hash The hash to verify against.
 * @param {string} password The password to verify.
 * @returns {Promise<boolean>} True if the password is valid, false otherwise.
 */
async function verifyPassword(hash, password) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    // Argon2 throws an error if verification fails.
    // We can inspect the error code to see if it's a verification mismatch
    // or a different kind of error. For simplicity, we'll treat any error
    // as a failed verification for security reasons.
    console.error('Error verifying password:', err.message);
    return false;
  }
}

/**
 * Derives a 32-byte key from a password and salt using Argon2.
 * This key is intended for symmetric encryption (e.g., AES-256).
 * @param {string} password The password to derive the key from.
 * @param {Buffer} salt A cryptographically strong salt, 16 bytes recommended.
 * @returns {Promise<Buffer>} A 32-byte Buffer representing the derived key.
 */
async function deriveKeyFromPassword(password, salt) {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      hashLength: KEY_LENGTH,
      salt,
      raw: true, // Return a raw Buffer
      timeCost: 3,
      memoryCost: 65536, // 64MB
      parallelism: 4,
    });
  } catch (err) {
    console.error('Error deriving key from password:', err);
    throw new Error('Could not derive key.');
  }
}

/**
 * Encrypts a piece of text using AES-256-CBC.
 * @param {string} text The plaintext to encrypt.
 * @param {Buffer} derivedKey A 32-byte encryption key.
 * @returns {string} The encrypted text, prefixed with the IV, in hex format.
 */
function encryptKeychainItem(text, derivedKey) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + encrypted;
}

/**
 * Decrypts a piece of text encrypted with AES-256-CBC.
 * @param {string} textWithIv The encrypted text, prefixed with the IV, in hex format.
 * @param {Buffer} derivedKey A 32-byte encryption key.
 * @returns {string} The decrypted plaintext.
 */
function decryptKeychainItem(textWithIv, derivedKey) {
  const iv = Buffer.from(textWithIv.slice(0, IV_LENGTH * 2), 'hex');
  const encryptedText = textWithIv.slice(IV_LENGTH * 2);
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = {
  hashPassword,
  verifyPassword,
  deriveKeyFromPassword,
  encryptKeychainItem,
  decryptKeychainItem,
};
