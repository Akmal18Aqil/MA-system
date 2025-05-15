import Users from "../models/UsersModel.mjs";
import argon2 from "argon2";
import { NotFoundError, ConflictError, ValidationError } from '../utils/error.mjs';

export const getUsers = async (req, res, next) => {
  try {
    // Ambil parameter paginasi dan filter dari query yang sudah divalidasi
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Hitung offset untuk paginasi
    const offset = (page - 1) * limit;
    
    // Buat opsi untuk query
    const options = {
      attributes: ['uuid', 'name', 'email', 'role'],
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    };
    
    // Jalankan query dengan opsi paginasi dan filter
    const { count, rows } = await Users.findAndCountAll(options);
    
    // Hitung total halaman
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      status: 'success',
      data: rows,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const response = await Users.findOne({
      attributes: ['uuid', 'name', 'email', 'role'],
      where: {
        uuid: req.params.id
      }
    });

    if (!response) {
      throw new NotFoundError('User');
    }

    res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, confPassword, role, nim } = req.body;

    // Validasi email tidak boleh duplikat
    const emailCheck = await Users.findOne({
      where: { email }
    });
    
    if (emailCheck) {
      throw new ConflictError('Email sudah digunakan');
    }

    // Jika role adalah 'mahasantri', pastikan nim diisi dan tidak duplikat
    if (role === "mahasantri") {
      // Cek duplikasi NIM
      const existingUser = await Users.findOne({
        where: { nim }
      });
      
      if (existingUser) {
        throw new ConflictError('NIM sudah terdaftar');
      }
    }

    const hashPassword = await argon2.hash(password);

    await Users.create({
      name,
      email,
      password: hashPassword,
      role,
      nim: role === "mahasantri" ? nim : null
    });

    res.status(201).json({
      status: 'success',
      msg: "Register Berhasil"
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        uuid: req.params.id
      }
    });
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    const { name, email, password, role } = req.body;
    
    // Cek apakah email sudah digunakan oleh user lain
    if (email !== user.email) {
      const emailCheck = await Users.findOne({
        where: { email }
      });
      
      if (emailCheck) {
        throw new ConflictError('Email sudah digunakan oleh user lain');
      }
    }
    
    let hashPassword;
    if (!password || password === '') {
      hashPassword = user.password;
    } else {
      hashPassword = await argon2.hash(password);
    }
    
    await Users.update({
      name,
      email,
      password: hashPassword,
      role
    }, {
      where: {
        id: user.id
      }
    });
    
    res.status(200).json({
      status: 'success',
      msg: "User berhasil diupdate"
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        uuid: req.params.id
      }
    });
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    await Users.destroy({
      where: {
        id: user.id
      }
    });
    
    res.status(200).json({
      status: 'success',
      msg: "User berhasil dihapus"
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Cari user dari session
    const user = await Users.findOne({
      where: { id: req.userId }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Validasi password lama
    const validPassword = await argon2.verify(user.password, oldPassword);
    if (!validPassword) {
      throw new ValidationError('Password lama salah');
    }

    // Validasi password baru tidak boleh sama dengan lama
    if (await argon2.verify(user.password, newPassword)) {
      throw new ValidationError('Password baru tidak boleh sama dengan password lama');
    }

    // Simpan password baru & update isFirstLogin jika perlu
    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    if (user.isFirstLogin) user.isFirstLogin = false;
    await user.save();

    res.status(200).json({
      status: 'success',
      msg: "Password berhasil diubah"
    });
  } catch (error) {
    next(error);
  }
};
