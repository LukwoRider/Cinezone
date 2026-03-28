import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const router = Router();
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

// Search movies on TMDB by query string
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || String(q).trim() === '') {
    return res.status(400).json({ error: 'Le paramètre q est requis' });
  }

  try {
    const url = `${TMDB_BASE}/search/movie?api_key=${process.env.TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(q)}&page=1`;
    const response = await fetch(url);
    const data = await response.json();

    const results = (data.results || []).slice(0, 8).map(movie => ({
      tmdb_id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster: movie.poster_path ? `${TMDB_IMG}/w200${movie.poster_path}` : null,
      rating: movie.vote_average,
    }));

    res.json(results);
  } catch (err) {
    console.error('TMDB search error:', err);
    res.status(500).json({ error: 'Erreur lors de la recherche TMDB' });
  }
});

// Get full details for a specific TMDB movie (including director)
router.get('/movie/:id', async (req, res) => {
  const tmdbId = req.params.id;

  try {
    // Fetch movie details and credits in parallel
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&language=fr-FR`),
      fetch(`${TMDB_BASE}/movie/${tmdbId}/credits?api_key=${process.env.TMDB_API_KEY}`),
    ]);

    const details = await detailsRes.json();
    const credits = await creditsRes.json();

    // Find the director from the crew list
    const director = (credits.crew || []).find(p => p.job === 'Director');

    // Download the poster to uploads/films/ if available
    let localPoster = null;
    if (details.poster_path) {
      const posterUrl = `${TMDB_IMG}/w500${details.poster_path}`;
      const filename = `tmdb-${tmdbId}-${Date.now()}.jpg`;
      const destPath = path.join(process.cwd(), 'uploads', 'films', filename);

      try {
        const imgRes = await fetch(posterUrl);
        if (imgRes.ok && imgRes.body) {
          const writeStream = fs.createWriteStream(destPath);
          await pipeline(Readable.fromWeb(imgRes.body), writeStream);
          localPoster = `/uploads/films/${filename}`;
        }
      } catch (imgErr) {
        console.error('Failed to download poster:', imgErr);
      }
    }

    // Map TMDB genres to a single genre name for category matching
    const genre = details.genres?.[0]?.name || null;

    res.json({
      title: details.title,
      director: director?.name || '',
      release_year: details.release_date ? new Date(details.release_date).getFullYear() : '',
      synopsis: details.overview || '',
      rating: details.vote_average ? Math.round(details.vote_average * 10) / 10 : '',
      genre,
      image: localPoster,
      poster_preview: details.poster_path ? `${TMDB_IMG}/w200${details.poster_path}` : null,
    });
  } catch (err) {
    console.error('TMDB movie details error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails TMDB' });
  }
});

export default router;
