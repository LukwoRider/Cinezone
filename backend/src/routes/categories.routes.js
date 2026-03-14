import { Router } from 'express';
import { db } from '../db/database.js';
import { notFound, badRequest, serverError } from '../utils/http.js';

const router = Router();

// Get all categories ordered alphabetically
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    serverError(res, err);
  }
});

// Get a single category by ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await db.query('SELECT id, name FROM categories WHERE id = ?', [id]);
    if (rows.length === 0) return notFound(res, 'Category not found');
    res.json(rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body ?? {};
    if (!name || String(name).trim() === '') return badRequest(res, 'name is required');

    const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
    const createdId = result.insertId;

    res
      .status(201)
      .location(`/categories/${createdId}`)
      .json({ id: createdId, name: name.trim() });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return badRequest(res, 'Category name already exists');
    }
    serverError(res, err);
  }
});

// Update an existing category by ID
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body ?? {};
    if (!name || String(name).trim() === '') return badRequest(res, 'name is required');

    const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), id]);
    if (result.affectedRows === 0) return notFound(res, 'Category not found');

    res.json({ id, name: name.trim() });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return badRequest(res, 'Category name already exists');
    }
    serverError(res, err);
  }
});

// Delete a category by ID
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) return notFound(res, 'Category not found');
    res.status(204).send();
  } catch (err) {
    serverError(res, err);
  }
});

export default router;
