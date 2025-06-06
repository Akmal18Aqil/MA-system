import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} from "../controllers/Users.mjs";
import { verifyToken, adminOnly } from "../middleware/JwtMiddleware.mjs";
import { validateRequest } from "../middleware/ValidationMiddleware.mjs";
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  idParamSchema,
  paginationSchema,
} from "../validation/Schema.mjs";

const router = express.Router();

router.get(
  "/users",
  verifyToken,
  adminOnly,
  validateRequest({ query: paginationSchema }),
  getUsers
);

router.get(
  "/users/:id",
  verifyToken,
  adminOnly,
  validateRequest({ params: idParamSchema }),
  getUserById
);

router.post(
  "/users",
  verifyToken,
  adminOnly,
  validateRequest({ body: createUserSchema }),
  createUser
);

router.patch(
  "/users/:id",
  verifyToken,
  adminOnly,
  validateRequest({
    body: updateUserSchema,
    params: idParamSchema,
  }),
  updateUser
);

router.delete(
  "/users/:id",
  verifyToken,
  adminOnly,
  validateRequest({ params: idParamSchema }),
  deleteUser
);

router.patch(
  "/change-password",
  verifyToken,
  validateRequest({ body: changePasswordSchema }),
  changePassword
);

export default router;
