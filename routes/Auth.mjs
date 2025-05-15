import express from "express";
import { Login, logOut, Me } from "../controllers/Auth.mjs";
import { validate } from "../middleware/ValidationMiddleware.mjs";
import { loginSchema } from "../validation/Schema.mjs";

const router = express.Router();

router.get('/me', Me);
router.post('/login', validate(loginSchema), Login);
router.delete('/logout', logOut);

export default router;
