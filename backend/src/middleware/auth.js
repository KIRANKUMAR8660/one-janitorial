import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_access_key_12345!');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Verify session still exists (Session management & Device tracking)
    const sessionExists = user.sessions.some(s => s.token === token);
    if (!sessionExists) {
      return res.status(401).json({ message: 'Session expired or logged out from this device' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};
