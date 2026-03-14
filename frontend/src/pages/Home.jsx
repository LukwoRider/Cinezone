import { useEffect, useState } from 'react';
import "../styles/home.css";
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import Modal from "../components/Modal";
import MovieForm from "./MovieForm";
import { FiHeart } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { useRef } from "react";
import "../styles/global.css";
import { useToast } from "../contexts/ToastContext";

function Home() {
  // State for all movies and currently displayed subset based on filters
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [minRating, setMinRating] = useState(Number(searchParams.get("rating")) || 0);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date_desc");
  const [showFavorites, setShowFavorites] = useState(searchParams.get("favorites") === "1");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const { showToast } = useToast();

  // Infinite scroll tracking state
  const [visibleCount, setVisibleCount] = useState(15);
  const [hasMore, setHasMore] = useState(true);
  const visibleMovies = filteredMovies.slice(0, visibleCount);
  const observerRef = useRef();

  // Fetch user favorites when token is available
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3300/favorites", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const ids = data.map(fav => Number(fav.id || fav.movie_id));
        setFavorites(ids);
      })
      .catch(err => console.error(err));
  }, [token]);
  const toggleFavorite = async (movieId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      showToast("Vous devez être connecté", "info");
      return;
    }

    movieId = Number(movieId);
    const isFav = favorites.includes(movieId);

    try {
      const res = await fetch(
        isFav
          ? `http://localhost:3300/favorites/${movieId}`
          : `http://localhost:3300/favorites`,
        {
          method: isFav ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: isFav ? null : JSON.stringify({ movieId })
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        console.error("Erreur API:", errData);
        return;
      }

      setFavorites(prev =>
        isFav ? prev.filter(id => id !== movieId) : [...prev, movieId]
      );
    } catch (err) {
      console.error("Erreur réseau:", err);
    }
  };

  // Fetch all movies from the backend on initial load
  useEffect(() => {
    fetch('http://localhost:3300/movies')
      .then(res => res.json())
      .then(data => {
        const moviesWithNumberIds = data.map(movie => ({ ...movie, id: Number(movie.id) }));
        setMovies(moviesWithNumberIds);
        setFilteredMovies(moviesWithNumberIds);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Fetch available categories for the filter dropdown
  useEffect(() => {
    fetch("http://localhost:3300/categories")
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (minRating !== 0) params.rating = minRating;
    if (sortBy !== "date_desc") params.sort = sortBy;
    if (showFavorites) params.favorites = "1";
    setSearchParams(params);
  }, [search, selectedCategory, minRating, sortBy, showFavorites, setSearchParams]);

  // Apply local filtering, searching, and sorting logic whenever dependencies change
  useEffect(() => {
    let result = [...movies];

    if (search.trim() !== "") {
      result = result.filter(movie =>
        movie.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(movie => movie.category === selectedCategory);
    }

    result = result.filter(movie => movie.rating >= minRating);

    if (showFavorites && token) {
      result = result.filter(movie => favorites.includes(Number(movie.id)));
    }

    switch (sortBy) {
      case "date_asc":
        result.sort((a, b) => a.release_year - b.release_year);
        break;
      case "date_desc":
        result.sort((a, b) => b.release_year - a.release_year);
        break;
      case "alpha_asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "alpha_desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    setFilteredMovies(result);
  }, [movies, search, selectedCategory, minRating, sortBy, showFavorites, favorites, token]);

  useEffect(() => {
    setVisibleCount(15);
  }, [search, selectedCategory, minRating, sortBy, showFavorites]);

  // Update "hasMore" state based on the number of filtered movies
  useEffect(() => {
    setHasMore(visibleCount < filteredMovies.length);
  }, [visibleCount, filteredMovies]);

  // IntersectionObserver for infinite scrolling implementation
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 15);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore]);

  if (loading) return <p className="status">Chargement...</p>;
  if (error) return <p className="status error">Erreur : {error}</p>;

  return (
    <div className="home">
      {user?.is_admin === 1 && (
        <div className="add-movie-button">
          <button onClick={() => setIsModalOpen(true)}>+ Ajouter un film</button>
        </div>
      )}

      <div className="filters">
        <input type="text" placeholder="🔍 Rechercher un film..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="all">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={typeof cat === "string" ? cat : cat.id} value={typeof cat === "string" ? cat : cat.name}>
              {typeof cat === "string" ? cat : cat.name}
            </option>
          ))}
        </select>
        <select value={minRating} onChange={e => setMinRating(Number(e.target.value))}>
          <option value="0">Toutes les notes</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>⭐ {n}+</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date_desc">Année ↓</option>
          <option value="date_asc">Année ↑</option>
          <option value="alpha_asc">A → Z</option>
          <option value="alpha_desc">Z → A</option>
        </select>
        {user && (
          <label className="favorites-toggle" style={{ color: showFavorites ? " var(--primary)" : " var(--white);", cursor: "pointer" }}>
            <input type="checkbox" checked={showFavorites} onChange={e => setShowFavorites(e.target.checked)} />
            Favoris
          </label>
        )}
      </div>

      <div className="movies-grid">
        {visibleMovies.map(movie => (
          <Link key={movie.id} to={`/movies/${movie.id}${location.search}`} className="movie-card">
            <div className="movie-card">
              {user && (
                <span
                  className={`favorite-heart ${favorites.includes(Number(movie.id)) ? "active" : ""}`}
                  onClick={e => toggleFavorite(movie.id, e)}
                >
                  {favorites.includes(Number(movie.id)) ? <FaHeart /> : <FiHeart />}
                </span>
              )}
              <img className="movie-image" src={movie.image || '/posters/default.jpg'} alt={movie.title} />
              <span className="movie-rating">
                <FaStar className="star-icon" />{movie.rating}
              </span>
              <div className="movie-overlay">
                <h3>{movie.title}</h3>
                <p><strong>Réalisateur :</strong> {movie.director}</p>
                <p><strong>Année :</strong> {movie.release_year}</p>
                <p><strong>Catégorie :</strong> {movie.category}</p>
                <p><strong>Note :</strong> <FaStar className="star-icon" />{movie.rating}/10</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {hasMore && <div ref={observerRef} style={{ height: "40px" }} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <MovieForm onSuccess={() => {
          setIsModalOpen(false);
          fetch('http://localhost:3300/movies')
            .then(res => res.json())
            .then(data => {
              const moviesWithNumberIds = data.map(movie => ({ ...movie, id: Number(movie.id) }));
              setMovies(moviesWithNumberIds);
              setFilteredMovies(moviesWithNumberIds);
            });
        }} />
      </Modal>
    </div>
  );
}

export default Home;
