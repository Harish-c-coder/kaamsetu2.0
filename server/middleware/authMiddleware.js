const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');

const JWT_SECRET = process.env.JWT_SECRET || 'hyperlocal_connect_secure_jwt_secret_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const worker = await Worker.findById(decoded.id).select('-password');

    if (!worker) {
      return res.status(401).json({
        success: false,
        message: 'Worker associated with token no longer exists',
      });
    }

    req.worker = worker;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token verification failed',
    });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = { protect, generateToken };
