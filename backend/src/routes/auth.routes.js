import express from "express";
import { register, login, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.put("/profile", authenticate, updateProfile);
router.put("/profile/password", authenticate, changePassword);

export default router;
