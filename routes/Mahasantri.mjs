import express from "express";
import { createMahasantri } from "../controllers/Mahasantri.mjs";
import { verifyToken, adminOnly } from "../middleware/JwtMiddleware.mjs";
import { validateRequest } from "../middleware/ValidationMiddleware.mjs";
import { createMahasantriSchema } from "../validation/Schema.mjs";

const router = express.Router();

// Hanya admin yang bisa akses endpoint ini
router.post('/mahasantri', 
  verifyToken, 
  adminOnly, 
  validateRequest({ body: createMahasantriSchema }), 
  createMahasantri
);

export default router;
