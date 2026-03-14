import express from "express";
import { db } from "../db/database.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get dashboard statistics (admin only)
router.get("/", authenticate, requireAdmin, async (_req, res) => {
    try {
        const [[{ totalMovies }]] = await db.query("SELECT COUNT(*) AS totalMovies FROM movies");
        const [[{ totalCategories }]] = await db.query("SELECT COUNT(*) AS totalCategories FROM categories");
        const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users WHERE is_admin = 0");
        const [[{ totalAdmins }]] = await db.query("SELECT COUNT(*) AS totalAdmins FROM users WHERE is_admin = 1");

        res.json({
            totalMovies,
            totalCategories,
            totalUsers,
            totalAdmins,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;
