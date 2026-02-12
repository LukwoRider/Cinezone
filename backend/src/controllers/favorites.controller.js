import { db } from "../db/database.js";

// --- Ajouter un favori ---
export const addFavorite = async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.body;

  if (!movieId) {
    return res.status(400).json({ error: "movieId manquant" });
  }

  try {
    await db.query(
      "INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)",
      [userId, movieId]
    );

    res.status(201).json({ message: "Film ajouté aux favoris" });
  } catch (err) {
    // Erreur si déjà en favori (UNIQUE constraint)
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Déjà en favori" });
    }

    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- Supprimer un favori ---
export const removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.params;

  try {
    await db.query(
      "DELETE FROM favorites WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    res.json({ message: "Film retiré des favoris" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- Récupérer les favoris de l'utilisateur ---
export const getUserFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `
      SELECT movies.*
      FROM favorites
      JOIN movies ON favorites.movie_id = movies.id
      WHERE favorites.user_id = ?
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- Vérifier si un film est en favori ---
export const isFavorite = async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    res.json({ isFavorite: rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
