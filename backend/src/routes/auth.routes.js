import express from "express";
import multer from "multer";
import path from "path";
import { register, login, updateProfile, changePassword, uploadAvatar } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

// Storage configuration for multer to handle avatar uploads
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/avatars");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
    },
});

// Multer middleware setup with file size limits and accepted formats
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Format d'image non supporté"), false);
        }
    },
});

const router = express.Router();

// Public authentication routes
router.post("/register", register);
router.post("/login", login);

// Protected profile management routes (requires authentication)
router.put("/profile", authenticate, updateProfile);
router.put("/profile/password", authenticate, changePassword);
router.put("/profile/avatar", authenticate, upload.single("avatar"), uploadAvatar);

export default router;
