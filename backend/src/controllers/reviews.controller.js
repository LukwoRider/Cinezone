import { db } from "../db/database.js";

/**
 * Recalcule le rating d'un film à partir de la moyenne des avis.
 * Si aucun avis, le rating passe à 0.
 */
async function recalcMovieRating(movieId) {
  await db.query(
    `UPDATE movies
     SET rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE movie_id = ?)
     WHERE id = ?`,
    [movieId, movieId]
  );
}

// --- Récupérer tous les avis d'un film ---
export const getMovieReviews = async (req, res) => {
  const { movieId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, r.user_id,
              u.firstname, u.lastname, u.avatar
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.movie_id = ?
       ORDER BY r.created_at DESC`,
      [movieId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- Ajouter un avis ---
export const addReview = async (req, res) => {
  const userId = req.user.id;
  const { movieId, rating, comment } = req.body;

  if (!movieId || rating === undefined || !comment) {
    return res.status(400).json({ error: "movieId, rating et comment sont requis" });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 10) {
    return res.status(400).json({ error: "La note doit être entre 1 et 10" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO reviews (user_id, movie_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [userId, movieId, numRating, comment]
    );

    await recalcMovieRating(movieId);

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      movie_id: movieId,
      rating: numRating,
      comment,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Vous avez déjà donné un avis pour ce film" });
    }
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- Modifier son propre avis ---
export const updateReview = async (req, res) => {
  const userId = req.user.id;
  const reviewId = Number(req.params.id);
  const { rating, comment } = req.body;

  if (rating === undefined || !comment) {
    return res.status(400).json({ error: "rating et comment sont requis" });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 10) {
    return res.status(400).json({ error: "La note doit être entre 1 et 10" });
  }

  try {
    // Vérifier que l'avis appartient bien à l'utilisateur
    const [rows] = await db.query(
      "SELECT movie_id FROM reviews WHERE id = ? AND user_id = ?",
      [reviewId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Avis non trouvé ou non autorisé" });
    }

    const movieId = rows[0].movie_id;

    await db.query(
      "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
      [numRating, comment, reviewId]
    );

    await recalcMovieRating(movieId);

    res.json({ message: "Avis modifié avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- Supprimer son propre avis ---
export const deleteReview = async (req, res) => {
  const userId = req.user.id;
  const reviewId = Number(req.params.id);

  try {
    // Récupérer le movie_id avant suppression pour recalculer le rating
    const [rows] = await db.query(
      "SELECT movie_id FROM reviews WHERE id = ? AND user_id = ?",
      [reviewId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Avis non trouvé ou non autorisé" });
    }

    const movieId = rows[0].movie_id;

    await db.query("DELETE FROM reviews WHERE id = ?", [reviewId]);

    await recalcMovieRating(movieId);

    res.json({ message: "Avis supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
