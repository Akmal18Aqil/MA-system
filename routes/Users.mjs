import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
} from "../controllers/Users.mjs";
import { verifyUser, adminOnly } from "../middleware/AuthUser.mjs";
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
  verifyUser,
  adminOnly,
  validateRequest({ query: paginationSchema }),
  getUsers
);

router.get(
  "/users/:id",
  verifyUser,
  adminOnly,
  validateRequest({ params: idParamSchema }),
  getUserById
);

router.post(
  "/users",
  verifyUser,
  adminOnly,
  validateRequest({ body: createUserSchema }),
  createUser
);

router.patch(
  "/users/:id",
  verifyUser,
  adminOnly,
  validateRequest({
    body: updateUserSchema,
    params: idParamSchema,
  }),
  updateUser
);

router.delete(
  "/users/:id",
  verifyUser,
  adminOnly,
  validateRequest({ params: idParamSchema }),
  deleteUser
);

router.patch(
  "/change-password",
  verifyUser,
  validateRequest({ body: changePasswordSchema }),
  changePassword
);

export default router;
