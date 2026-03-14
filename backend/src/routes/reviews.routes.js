import express from "express";
import {
    getMovieReviews,
    addReview,
    updateReview,
    deleteReview,
} from "../controllers/reviews.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Route publique : voir les avis d'un film
router.get("/:movieId", getMovieReviews);

// Routes protégées : nécessitent connexion
router.post("/", authenticate, addReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
