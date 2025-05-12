import express from "express";
import {Login, logOut, Me} from "../controllers/Auth.mjs";

const router = express.Router();

router.post('/login', Login);
router.get('/me', Me);
router.delete('/logout', logOut);

export default router;