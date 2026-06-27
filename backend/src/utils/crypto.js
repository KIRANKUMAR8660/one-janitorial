import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || 'default_super_secret_encryption_key_9876543210!').digest();

/**
 * Encrypts a text using AES-256-CBC
 * @param {string} text Plain text to encrypt
 * @returns {object} Object containing encrypted value and iv (hex)
 */
export const encrypt = (text) => {
  if (!text) return { value: '', iv: '' };
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    value: encrypted,
    iv: iv.toString('hex')
  };
};

/**
 * Decrypts an encrypted hex string using AES-256-CBC and the provided IV
 * @param {string} encryptedText Encrypted hex string
 * @param {string} ivHex Hex string representation of the IV
 * @returns {string} Plain decrypted text
 */
export const decrypt = (encryptedText, ivHex) => {
  if (!encryptedText || !ivHex) return '';
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
