import Users from "../models/UsersModel.mjs";
import argon2 from "argon2";
import { AuthorizationError, ConflictError } from '../utils/error.mjs';

export const createMahasantri = async (req, res, next) => {
  try {
    const { name, email, nim } = req.body;

    // Cek apakah yang mengakses adalah admin
    if (req.role !== "admin") {
      throw new AuthorizationError('Hanya admin yang bisa menambah mahasantri');
    }

    // Cek duplikasi email dan nim
    const existingEmail = await Users.findOne({ where: { email } });
    const existingNIM = await Users.findOne({ where: { nim } });
    
    if (existingEmail) {
      throw new ConflictError('Email sudah terdaftar');
    }
    
    if (existingNIM) {
      throw new ConflictError('NIM sudah digunakan');
    }

    // Hash password dengan nim sebagai string
    const hashPassword = await argon2.hash(nim.toString());

    // Simpan user baru
    await Users.create({
      name,
      email,
      nim,
      password: hashPassword,
      role: "mahasantri",
      isFirstLogin: true
    });

    res.status(201).json({
      status: 'success',
      msg: "Mahasantri berhasil ditambahkan. Password default = NIM."
    });
  } catch (error) {
    next(error);
  }
};
