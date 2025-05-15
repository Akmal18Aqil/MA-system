import User from "../models/UsersModel.mjs";
import { AuthenticationError, AuthorizationError, NotFoundError } from '../utils/error.mjs';

export const verifyUser = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      throw new AuthenticationError();
    }
    
    const user = await User.findOne({
      where: {
        uuid: req.session.userId
      }
    });
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    req.userId = user.id;
    req.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        uuid: req.session.userId
      }
    });
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    if (user.role !== "admin") {
      throw new AuthorizationError('Akses terlarang: Hanya admin yang dapat mengakses resource ini');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
