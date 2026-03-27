import { Router } from 'express';
import { db } from '../db/database.js';
import { badRequest, notFound, serverError } from '../utils/http.js';

const router = Router();

// Get all movies with their respective category names
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.id, m.title, m.director, m.release_year, m.rating, m.initial_rating, m.category_id, m.image, m.synopsis, c.name AS category
      FROM movies m
      LEFT JOIN categories c ON c.id = m.category_id
      ORDER BY m.id DESC
    `);
    res.json(rows);
  } catch (err) {
    serverError(res, err);
  }
});

// Get a single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await db.query(`
      SELECT m.id, m.title, m.director, m.release_year, m.rating, m.initial_rating, m.category_id, m.image, m.synopsis, c.name AS category
      FROM movies m
      LEFT JOIN categories c ON c.id = m.category_id
      WHERE m.id = ?
    `, [id]);
    if (rows.length === 0) return notFound(res, 'Movie not found');
    res.json(rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

// Helper function to validate movie payload data
function validateMoviePayload(body) {
  const { title, director, release_year, rating, category_id, synopsis } = body ?? {};
  if (!title || !director) return 'title and director are required';
  if (release_year === undefined || isNaN(Number(release_year))) return 'release_year must be a number';
  if (rating === undefined || isNaN(Number(rating))) return 'rating must be a number';
  if (category_id !== null && category_id !== undefined && isNaN(Number(category_id))) {
    return 'category_id must be a number or null';
  }
  if (!synopsis || String(synopsis).trim() === '') return 'synopsis is required';
  return null;
}

// Create a new movie
router.post('/', async (req, res) => {
  try {
    const errMsg = validateMoviePayload(req.body);
    if (errMsg) return badRequest(res, errMsg);

    const { title, director, release_year, rating, category_id, synopsis } = req.body;

    const [result] = await db.query(`
      INSERT INTO movies (title, director, release_year, rating, initial_rating, category_id, image, synopsis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, director, Number(release_year), Number(rating), Number(rating), category_id ?? null, req.body.image ?? null, synopsis]);

    const createdId = result.insertId;

    res
      .status(201)
      .location(`/movies/${createdId}`)
      .json({ id: createdId, title, director, release_year: Number(release_year), rating: Number(rating), category_id: category_id ?? null, synopsis });
  } catch (err) {
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
      return badRequest(res, 'category_id does not exist');
    }
    serverError(res, err);
  }
});

// Update an existing movie by ID
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const errMsg = validateMoviePayload(req.body);
    if (errMsg) return badRequest(res, errMsg);

    const { title, director, release_year, rating, category_id, synopsis } = req.body;

    const [result] = await db.query(`
      UPDATE movies
      SET title = ?, director = ?, release_year = ?, rating = ?, initial_rating = ?, category_id = ?, image = ?, synopsis = ?
      WHERE id = ?
    `, [title, director, Number(release_year), Number(rating), Number(rating), category_id ?? null, req.body.image ?? null, synopsis, id]);

    if (result.affectedRows === 0) return notFound(res, 'Movie not found');

    res.json({ id, title, director, release_year: Number(release_year), rating: Number(rating), category_id: category_id ?? null, synopsis });
  } catch (err) {
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
      return badRequest(res, 'category_id does not exist');
    }
    serverError(res, err);
  }
});

// Delete a movie by ID
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await db.query('DELETE FROM movies WHERE id = ?', [id]);
    if (result.affectedRows === 0) return notFound(res, 'Movie not found');
    res.status(204).send();
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
