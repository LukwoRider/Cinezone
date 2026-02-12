import express from 'express';
import dotenv from 'dotenv';
import moviesRouter from './src/routes/movies.routes.js';
import categoriesRouter from './src/routes/categories.routes.js';
import { testDbConnection } from './src/db/database.js';
import cors from 'cors';
import authRouter from "./src/routes/auth.routes.js";
import favoritesRouter from "./src/routes/favorites.routes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

// middlewares
app.use(cors());
app.use(express.json());

// auth
app.use("/auth", authRouter);

// favorites
app.use("/favorites", favoritesRouter);

// routes
app.use('/movies', moviesRouter);
// app.use('/', moviesRouter);
app.use('/categories', categoriesRouter);

// santé
app.get('/test', (_req, res) => {
  res.json({ service: 'CineZone API', status: 'ok' });
});

// 404 global
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// start
(async function start() {
  try {
    await testDbConnection();
    app.listen(PORT, () => {
      console.log(`🚀 CineZone API on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Impossible de démarrer le serveur', err);
    process.exit(1);
  }
})();
