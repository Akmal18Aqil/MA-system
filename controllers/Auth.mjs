import Users from "../models/UsersModel.mjs";
import argon2 from "argon2";
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/error.mjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.mjs';


export const Login = async (req, res, next) => {
  try {
    if (!req.body) {
      throw new ValidationError('Body tidak terdefinisi');
    }

    const user = await Users.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      throw new NotFoundError('User Tidak ada');
    }

    const match = await argon2.verify(user.password, req.body.password);
    if (!match) {
      throw new AuthenticationError('Email atau password salah');
    }

    // Generate Tokens
    const payload = { userId: user.uuid, name: user.name, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token to database
    await Users.update({ refreshToken: refreshToken }, {
      where: {
        id: user.id
      }
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      // secure: process.env.NODE_ENV === 'production' // Use secure in production
    });

    // If first login and role mahasantri
    if (user.isFirstLogin && user.role === "mahasantri") {
      return res.status(200).json({
        status: 'success',
        msg: "Login pertama, silakan ganti password Anda.",
        isFirstLogin: true,
        accessToken: accessToken // Still return access token for first login
      });
    }

    // Return access token in response body
    res.status(200).json({
      status: 'success',
      accessToken: accessToken,
      data: { uuid: user.uuid, name: user.name, email: user.email, role: user.role } // Optionally return user data
    });

  } catch (error) {
    next(error);
  }
};

export const Me = async (req, res, next) => {
  try {
    // req.userId and req.role are now attached by verifyToken middleware
    const user = await Users.findOne({
      attributes: ['uuid', 'name', 'email', 'role'],
      where: {
        uuid: req.userId // Use userId from token payload
      }
    });

    if (!user) {
      // This case should ideally not happen if verifyToken works correctly
      // but good for robustness.
      throw new NotFoundError('User');
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      // If no refresh token, user is already logged out or never logged in with JWT
      return res.status(200).json({
        status: 'success',
        msg: "Anda telah logout"
      });
    }

    const user = await Users.findOne({
      where: {
        refreshToken: refreshToken
      }
    });

    if (!user) {
      // If refresh token doesn't match any user, just clear the cookie
      res.clearCookie('refreshToken');
      return res.status(200).json({
        status: 'success',
        msg: "Anda telah logout"
      });
    }

    // Remove refresh token from database
    await Users.update({ refreshToken: null }, {
      where: {
        id: user.id
      }
    });

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      status: 'success',
      msg: "Anda telah logout"
    });

  } catch (error) {
    next(error);
  }
};

// New function to refresh access token (already provided in previous step)
export const refreshToken = async (req, res, next) => {
  try {
    console.log("COOKIE DITERIMA:", req.cookies);
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token tidak ditemukan');
    }

    const user = await Users.findOne({
      where: {
        refreshToken: refreshToken
      }
    });

    if (!user) {
      throw new AuthenticationError('Refresh token tidak valid');
    }

    // Verify the refresh token
    verifyRefreshToken(refreshToken); // This will throw if token is expired or invalid

    // Generate a new access token
    const payload = { userId: user.uuid, name: user.name, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);

    res.status(200).json({
      status: 'success',
      accessToken: accessToken
    });

  } catch (error) {
    console.error("Gagal verifikasi refresh token:", error.message);
    // If refresh token verification fails (e.g., expired), clear the cookie
    res.clearCookie('refreshToken');
    next(new AuthenticationError('Refresh token tidak valid atau kadaluarsa'));
  }
};