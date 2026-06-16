const bcrypt = require('bcryptjs');

// 12 rounds is the current production standard, balancing security and performance
const SALT_ROUNDS = 12; 

/**
 * Hashes a plaintext password securely.
 * @param {string} password - The raw password string to hash.
 * @returns {Promise<string>} The resulting bcrypt hash.
 */
const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('A valid password string is required for hashing.');
  }
  
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    // We intentionally abstract the error so we don't leak internal crypto details
    throw new Error('A severe system error occurred during password encryption.');
  }
};

/**
 * Verifies a plaintext password against an existing hash.
 * @param {string} password - The raw password string provided during login.
 * @param {string} hash - The stored bcrypt hash from the database.
 * @returns {Promise<boolean>} True if it's a match, false otherwise.
 */
const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    throw new Error('Both plaintext password and hash are required for comparison.');
  }

  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    throw new Error('A severe system error occurred during password verification.');
  }
};

module.exports = {
  hashPassword,
  comparePassword
};
