import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import "../../styles/AdminMovies.css";
import Modal from "../../components/Modal";
import MovieForm from "../MovieForm";
import { useToast } from "../../contexts/ToastContext";
import { useConfirm } from "../../contexts/ConfirmContext";

function AdminMovies() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
    const [editingMovieId, setEditingMovieId] = useState(null);

    useEffect(() => {
        if (!user || user.is_admin !== 1) {
            navigate("/");
        }
    }, [user, navigate]);

    const fetchMovies = () => {
        setLoading(true);
        fetch("http://localhost:3000/movies")
            .then(res => res.json())
            .then(data => setMovies(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleDeleteMovie = async (movieId, title) => {
        const isConfirmed = await confirm(`Voulez-vous vraiment supprimer le film "${title}" ?`);
        if (!isConfirmed) return;

        try {
            const res = await fetch(`http://localhost:3000/movies/${movieId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Erreur lors de la suppression du film");

            fetchMovies();
            showToast(`Film "${title}" supprimé avec succès.`, "success");
        } catch (err) {
            showToast(err.message, "error");
        }
    };

    const openMovieModal = (id = null) => {
        setEditingMovieId(id);
        setIsMovieModalOpen(true);
    };

    if (loading) {
        return <p style={{ textAlign: "center", marginTop: 100, color: "#ccc" }}>Chargement des films...</p>;
    }

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (movie.director && movie.director.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="admin-movies-page">
            <div className="admin-movies-header">
                <button className="back-button" onClick={() => navigate("/admin")}>
                    <MdArrowBack /> Retour au Dashboard
                </button>
                <h1>Gestion des films</h1>
                <button className="add-button" onClick={() => openMovieModal(null)}>
                    <MdAdd /> Ajouter un film
                </button>
            </div>

            <div className="admin-movies-search">
                <input
                    type="text"
                    placeholder="Rechercher un film par titre ou réalisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-search-input"
                />
            </div>

            <div className="movies-list-container">
                {filteredMovies.length === 0 ? (
                    <p className="no-movies">
                        {movies.length === 0 ? "Aucun film trouvé." : "Aucun film ne correspond à votre recherche."}
                    </p>
                ) : (
                    <ul className="movies-list">
                        {filteredMovies.map(movie => (
                            <li key={movie.id} className="movie-list-item">
                                <div className="movie-info">
                                    {movie.image ? (
                                        <img src={movie.image} alt={movie.title} className="movie-thumbnail" />
                                    ) : (
                                        <div className="movie-thumbnail placeholder">No Img</div>
                                    )}
                                    <div>
                                        <div className="movie-title">{movie.title}</div>
                                        <div className="movie-meta">{movie.release_year} • {movie.director}</div>
                                    </div>
                                </div>
                                <div className="movie-actions">
                                    <button className="action-button edit" onClick={() => openMovieModal(movie.id)}>
                                        <MdEdit size={18} /> Modifier
                                    </button>
                                    <button className="action-button delete" onClick={() => handleDeleteMovie(movie.id, movie.title)}>
                                        <MdDelete size={18} /> Supprimer
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isMovieModalOpen && (
                <Modal isOpen={isMovieModalOpen} onClose={() => setIsMovieModalOpen(false)}>
                    <div style={{ maxHeight: "80vh", paddingRight: "16px", marginRight: "-8px" }}>
                        <MovieForm
                            id={editingMovieId}
                            onSuccess={() => {
                                setIsMovieModalOpen(false);
                                fetchMovies();
                            }}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default AdminMovies;
