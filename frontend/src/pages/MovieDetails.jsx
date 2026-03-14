import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import "../styles/MovieDetails.css";
import Modal from "../components/Modal";
import MovieForm from "./MovieForm";
import ReviewSection from "../components/ReviewSection";
import { FiHeart } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import "../styles/global.css";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const fetchMovie = useCallback(() => {
    fetch(`http://localhost:3000/movies/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Film introuvable');
        return res.json();
      })
      .then(data => setMovie({ ...data, id: Number(data.id) }))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3000/favorites", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFavorites(data.map(fav => Number(fav.id || fav.movie_id))))
      .catch(console.error);
  }, [token]);

  const toggleFavorite = async () => {
    if (!token || !movie) {
      alert("Vous devez être connecté");
      return;
    }

    const movieId = Number(movie.id);
    const isFav = favorites.includes(movieId);

    try {
      const res = await fetch(
        isFav
          ? `http://localhost:3000/favorites/${movieId}`
          : `http://localhost:3000/favorites`,
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

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce film ?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:3000/movies/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        alert("Film supprimé !");
        navigate("/");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Impossible de supprimer le film");
      }
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="status">Chargement...</p>;
  if (error) return <p className="status error">Erreur : {error}</p>;

  const isFavorite = movie && favorites.includes(Number(movie.id));

  return (
    <div className="movie-details">
      <Link to={`/${location.search || ""}`} className="back-link">
        ← Retour à l’accueil
      </Link>

      <h1 className="movie-title">{movie.title}</h1>

      <div className="movie-details-content">
        <div style={{ position: 'relative' }}>
          <img
            className="movie-details-image"
            src={movie.image || '/posters/default.jpg'}
            alt={movie.title}
          />

          {user && (
            <span
              className={`favorite-heart-details ${isFavorite ? "active" : ""}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? <FaHeart /> : <FiHeart />}
            </span>
          )}
        </div>

        <div className="movie-details-info">
          <div className="movie-synopsis">
            <h3>Synopsis</h3>
            <p>{movie.synopsis}</p>
          </div>
          <p><strong>Réalisateur :</strong> {movie.director}</p>
          <p><strong>Année :</strong> {movie.release_year}</p>
          <p><strong>Catégorie :</strong> {movie.category}</p>
          <p className="movie-details-rating">
            <FaStar className="star-icon" /> {movie.rating}/10
          </p>

          {user?.is_admin === 1 && (
            <div className="button-contain button-contain-details">
              <button className="edit-button" onClick={() => setIsEditModalOpen(true)}>
                Modifier le film
              </button>
              <button className="delete-button" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Suppression..." : "Supprimer le film"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ReviewSection movieId={id} onReviewChange={fetchMovie} />

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <MovieForm
          movie={movie}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchMovie();
          }}
        />
      </Modal>
    </div>
  );
}

export default MovieDetails;
