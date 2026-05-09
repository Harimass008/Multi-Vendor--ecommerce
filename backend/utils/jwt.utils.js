const jwt = require('jsonwebtoken');

const ensureSecret = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined. Set it in backend/.env or your environment.`);
  }
  return value;
};

const generateAccessToken = (payload) => {
  return jwt.sign(payload, ensureSecret('JWT_ACCESS_SECRET'), {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, ensureSecret('JWT_REFRESH_SECRET'), {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ensureSecret('JWT_ACCESS_SECRET'));
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, ensureSecret('JWT_REFRESH_SECRET'));
};

const generateTokenPair = (payload) => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, generateTokenPair };
