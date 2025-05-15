import Users from "../models/UsersModel.mjs";
import argon2 from "argon2";
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/error.mjs';

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
      throw new NotFoundError('User');
    }
    
    const match = await argon2.verify(user.password, req.body.password);
    if (!match) {
      throw new ValidationError('Password salah');
    }
    
    req.session.userId = user.uuid;
    
    // Jika login pertama dan role mahasantri
    if (user.isFirstLogin && user.role === "mahasantri") {
      return res.status(200).json({
        status: 'success',
        msg: "Login pertama, silakan ganti password Anda.",
        isFirstLogin: true
      });
    }
    
    const { uuid, name, email, role } = user;
    res.status(200).json({
      status: 'success',
      data: { uuid, name, email, role }
    });
  } catch (error) {
    next(error);
  }
};

export const Me = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      throw new AuthenticationError();
    }
    
    const user = await Users.findOne({
      attributes: ['uuid', 'name', 'email', 'role'],
      where: {
        uuid: req.session.userId
      }
    });
    
    if (!user) {
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

export const logOut = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new Error('Tidak dapat logout'));
    }
    
    res.status(200).json({
      status: 'success',
      msg: "Anda telah logout"
    });
  });
};
