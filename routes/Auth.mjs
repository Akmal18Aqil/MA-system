import express from "express";
import { Login, logOut, Me, refreshToken } from "../controllers/Auth.mjs";
import { validate } from "../middleware/ValidationMiddleware.mjs";
import { loginSchema } from "../validation/Schema.mjs";
import { verifyToken,  } from "../middleware/JwtMiddleware.mjs";

const router = express.Router();

router.get('/me', verifyToken, Me); // 
router.post('/login', validate(loginSchema), Login);
router.delete('/logout', logOut);
router.get('/token', refreshToken);

export default router;
