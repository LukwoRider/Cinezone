import express from "express";
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorite
} from "../controllers/favorites.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, addFavorite);
router.delete("/:movieId", authenticate, removeFavorite);
router.get("/", authenticate, getUserFavorites);
router.get("/check/:movieId", authenticate, isFavorite);

export default router;
