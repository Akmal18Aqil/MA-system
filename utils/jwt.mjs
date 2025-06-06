import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' }); // Access token expires in 15 minutes
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '1h' }); // Refresh token expires in 7 days
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};