import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { FiCamera } from "react-icons/fi";
import "../styles/MovieForm.css";
import "../styles/global.css";
import { useToast } from "../contexts/ToastContext";

function MovieForm({ onSuccess, id: propId }) {
  const { id } = useParams();
  const actualId = propId || id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    director: "",
    release_year: "",
    rating: "",
    category_id: "",
    synopsis: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(actualId ? true : false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3300/categories")
      .then(res => {
        if (!res.ok) throw new Error("Impossible de charger les catégories");
        return res.json();
      })
      .then(setCategories)
      .catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    if (!actualId) return;

    fetch(`http://localhost:3300/movies/${actualId}`)
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
          synopsis: data.synopsis || ""
        });
        // Show existing image as preview
        if (data.image) {
          const src = data.image.startsWith('/uploads')
            ? `http://localhost:3300${data.image}`
            : data.image;
          setImagePreview(src);
        }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validateRating = value => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 10;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.title || !form.director || !form.release_year || !form.rating || !form.category_id) {
      setError("Tous les champs sont requis");
      return;
    }
    if (!actualId && !imageFile && !imagePreview) {
      setError("Une image est requise");
      return;
    }
    if (!validateRating(form.rating)) {
      setError("La note doit être comprise entre 0 et 10 inclus");
      return;
    }

    setLoading(true);
    try {
      const url = actualId ? `http://localhost:3300/movies/${actualId}` : "http://localhost:3300/movies";
      const method = actualId ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("director", form.director);
      formData.append("release_year", Number(form.release_year));
      formData.append("rating", Number(form.rating));
      formData.append("category_id", Number(form.category_id));
      formData.append("synopsis", form.synopsis);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Impossible d'enregistrer le film");
      }

      showToast(actualId ? "Film modifié avec succès !" : "Film ajouté avec succès !", "success");

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

        <label>Affiche du film :</label>
        <div className="movie-image-upload" onClick={() => fileInputRef.current?.click()}>
          {imagePreview ? (
            <img src={imagePreview} alt="Aperçu" className="movie-image-preview" />
          ) : (
            <div className="movie-image-placeholder">
              <FiCamera size={32} />
              <span>Cliquez pour ajouter une image</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>
        {imagePreview && (
          <p className="movie-image-hint" onClick={() => fileInputRef.current?.click()}>
            Cliquez sur l'image pour la changer
          </p>
        )}

        <button className="edit-button" type="submit" disabled={loading}>
          {loading ? (actualId ? "Modification en cours..." : "Ajout en cours...") : (actualId ? "Modifier le film" : "Ajouter le film")}
        </button>
      </form>
    </div>
  );
}

export default MovieForm;
