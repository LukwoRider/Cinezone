import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/database.js';
import { badRequest, notFound, serverError } from '../utils/http.js';

const router = Router();

// Multer storage configuration for movie poster uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/films");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `film-${Date.now()}${ext}`);
  },
});

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

// Helper: delete an old image file from disk if it exists
function deleteOldImage(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/films/')) return;
  const fullPath = path.join(process.cwd(), imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

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

// Create a new movie (with optional image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const errMsg = validateMoviePayload(req.body);
    if (errMsg) return badRequest(res, errMsg);

    const { title, director, release_year, rating, category_id, synopsis } = req.body;
    const imagePath = req.file ? `/uploads/films/${req.file.filename}` : (req.body.image || null);

    const [result] = await db.query(`
      INSERT INTO movies (title, director, release_year, rating, initial_rating, category_id, image, synopsis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, director, Number(release_year), Number(rating), Number(rating), category_id ?? null, imagePath, synopsis]);

    const createdId = result.insertId;

    res
      .status(201)
      .location(`/movies/${createdId}`)
      .json({ id: createdId, title, director, release_year: Number(release_year), rating: Number(rating), category_id: category_id ?? null, image: imagePath, synopsis });
  } catch (err) {
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
      return badRequest(res, 'category_id does not exist');
    }
    serverError(res, err);
  }
});

// Update an existing movie by ID (with optional image upload)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const errMsg = validateMoviePayload(req.body);
    if (errMsg) return badRequest(res, errMsg);

    const { title, director, release_year, rating, category_id, synopsis } = req.body;

    // If a new file is uploaded, delete the old image
    let imagePath;
    if (req.file) {
      const [existing] = await db.query('SELECT image FROM movies WHERE id = ?', [id]);
      if (existing.length > 0) {
        deleteOldImage(existing[0].image);
      }
      imagePath = `/uploads/films/${req.file.filename}`;
    } else {
      // Keep existing image if no new file is uploaded
      imagePath = req.body.image || null;
    }

    const [result] = await db.query(`
      UPDATE movies
      SET title = ?, director = ?, release_year = ?, rating = ?, initial_rating = ?, category_id = ?, image = ?, synopsis = ?
      WHERE id = ?
    `, [title, director, Number(release_year), Number(rating), Number(rating), category_id ?? null, imagePath, synopsis, id]);

    if (result.affectedRows === 0) return notFound(res, 'Movie not found');

    res.json({ id, title, director, release_year: Number(release_year), rating: Number(rating), category_id: category_id ?? null, image: imagePath, synopsis });
  } catch (err) {
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
      return badRequest(res, 'category_id does not exist');
    }
    serverError(res, err);
  }
});

// Delete a movie by ID (also removes the poster image)
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Delete the poster image before removing the DB record
    const [rows] = await db.query('SELECT image FROM movies WHERE id = ?', [id]);
    if (rows.length > 0) {
      deleteOldImage(rows[0].image);
    }

    const [result] = await db.query('DELETE FROM movies WHERE id = ?', [id]);
    if (result.affectedRows === 0) return notFound(res, 'Movie not found');
    res.status(204).send();
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
