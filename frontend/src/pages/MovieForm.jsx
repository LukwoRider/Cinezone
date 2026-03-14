import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import "../styles/MovieForm.css";
import "../styles/global.css";

function MovieForm({ onSuccess, id: propId }) {
  const { id } = useParams();
  const actualId = propId || id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    director: "",
    release_year: "",
    rating: "",
    category_id: "",
    image: "",
    synopsis: ""
  });

  const [loading, setLoading] = useState(actualId ? true : false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/categories")
      .then(res => {
        if (!res.ok) throw new Error("Impossible de charger les catégories");
        return res.json();
      })
      .then(setCategories)
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    if (!actualId) return;

    fetch(`http://localhost:3000/movies/${actualId}`)
      .then(res => {
        if (!res.ok) throw new Error("Film introuvable");
        return res.json();
      })
      .then(data => {
        setForm({
          title: data.title,
          director: data.director,
          release_year: data.release_year,
          rating: data.rating,
          category_id: data.category_id,
          image: data.image || "",
          synopsis: data.synopsis || ""
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [actualId]);


  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateRating = value => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 10;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.title || !form.director || !form.release_year || !form.rating || !form.category_id || !form.image) {
      setError("Tous les champs sont requis");
      return;
    }
    if (!validateRating(form.rating)) {
      setError("La note doit être comprise entre 0 et 10 inclus");
      return;
    }

    setLoading(true);
    try {
      const url = actualId ? `http://localhost:3000/movies/${actualId}` : "http://localhost:3000/movies";
      const method = actualId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          director: form.director,
          release_year: Number(form.release_year),
          rating: Number(form.rating),
          category_id: Number(form.category_id),
          image: form.image,
          synopsis: form.synopsis
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Impossible d’enregistrer le film");
      }

      alert(actualId ? "Film modifié avec succès !" : "Film ajouté avec succès !");

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(actualId ? `/movies/${actualId}` : "/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="status">Chargement...</p>;

  return (
    <div className="add-movie">

      <h1>{actualId ? "Modifier le film" : "Ajouter un film"}</h1>

      {error && <p className="status error">{error}</p>}

      <form onSubmit={handleSubmit} className="movie-form">
        <label>
          Titre :
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Réalisateur :
          <input
            type="text"
            name="director"
            value={form.director}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Année :
          <input
            type="number"
            name="release_year"
            value={form.release_year}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Synopsis :
          <textarea
            name="synopsis"
            value={form.synopsis}
            onChange={handleChange}
            rows="5"
            required
            placeholder="Résumé du film..."
          />
        </label>

        <label>
          Note (0-10) :
          <input
            type="number"
            name="rating"
            step="0.1"
            min="0"
            max="10"
            value={form.rating}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Catégorie :
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Choisir une catégorie --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>

        <label>
          URL de l’image :
          <input
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            required
          />
        </label>

        <button className="edit-button" type="submit" disabled={loading}>
          {loading ? (actualId ? "Modification en cours..." : "Ajout en cours...") : (actualId ? "Modifier le film" : "Ajouter le film")}
        </button>
      </form>
    </div>
  );
}

export default MovieForm;
