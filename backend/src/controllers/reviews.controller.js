import { db } from "../db/database.js";

// Recalculates and updates the average rating of a movie when reviews are added/modified
// Includes the initial_rating (given at movie creation) as part of the average
async function recalcMovieRating(movieId) {
  await db.query(
    `UPDATE movies m
     SET m.rating = (
       SELECT (COALESCE(SUM(r.rating), 0) + m.initial_rating) / (COUNT(r.id) + 1)
       FROM reviews r
       WHERE r.movie_id = ?
     )
     WHERE m.id = ?`,
    [movieId, movieId]
  );
}

// Retrieves all reviews for a specific movie with reviewer's details
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

// Adds a new review for a movie
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

// Updates an existing review (only allowed for the user who created it)
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

// Deletes a review from the database
export const deleteReview = async (req, res) => {
  const userId = req.user.id;
  const reviewId = Number(req.params.id);

  try {
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
