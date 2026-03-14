import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdMovie, MdCategory, MdPeople, MdAdminPanelSettings, MdAdd, MdHome } from "react-icons/md";
import "../../styles/AdminDashboard.css";
import Modal from "../../components/Modal";
import MovieForm from "../MovieForm";

function AdminDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        if (!user || user.is_admin !== 1) {
            navigate("/");
        }
    }, [user, navigate]);

    const fetchStats = () => {
        if (!token) return;
        fetch("http://localhost:3000/stats", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStats();
    }, [token]);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        try {
            const res = await fetch("http://localhost:3000/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: categoryName.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erreur lors de l'ajout");
            }

            setCategoryName("");
            setIsCategoryModalOpen(false);
            fetchStats();
            alert("Catégorie ajoutée avec succès !");
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return <p style={{ textAlign: "center", marginTop: 100, color: "#ccc" }}>Chargement...</p>;
    }

    return (
        <div className="admin-dashboard">
            <h1>Dashboard Admin</h1>

            <div className="stats-grid">
                <div
                    className="stat-card"
                    onClick={() => navigate("/admin/movies")}
                    style={{ cursor: "pointer" }}
                    title="Gérer les films"
                >
                    <div className="stat-icon movies">
                        <MdMovie />
                    </div>
                    <span className="stat-value">{stats?.totalMovies ?? 0}</span>
                    <span className="stat-label">Films</span>
                </div>

                <div
                    className="stat-card"
                    onClick={() => navigate("/admin/categories")}
                    style={{ cursor: "pointer" }}
                    title="Gérer les catégories"
                >
                    <div className="stat-icon categories">
                        <MdCategory />
                    </div>
                    <span className="stat-value">{stats?.totalCategories ?? 0}</span>
                    <span className="stat-label">Catégories</span>
                </div>

                <div
                    className="stat-card"
                    onClick={() => navigate("/admin/users")}
                    style={{ cursor: "pointer" }}
                    title="Gérer les utilisateurs"
                >
                    <div className="stat-icon users">
                        <MdPeople />
                    </div>
                    <span className="stat-value">{stats?.totalUsers ?? 0}</span>
                    <span className="stat-label">Utilisateurs</span>
                </div>

                <div
                    className="stat-card"
                    onClick={() => navigate("/admin/users")}
                    style={{ cursor: "pointer" }}
                    title="Gérer les administrateurs"
                >
                    <div className="stat-icon admins">
                        <MdAdminPanelSettings />
                    </div>
                    <span className="stat-value">{stats?.totalAdmins ?? 0}</span>
                    <span className="stat-label">Admins</span>
                </div>
            </div>

            <h3 className="admin-section-title">Actions rapides</h3>
            <div className="quick-links">
                <button className="quick-link" onClick={() => setIsMovieModalOpen(true)}>
                    <div className="quick-link-icon">
                        <MdAdd />
                    </div>
                    Ajouter un film
                </button>

                <button className="quick-link" onClick={() => setIsCategoryModalOpen(true)}>
                    <div className="quick-link-icon">
                        <MdAdd />
                    </div>
                    Ajouter une catégorie
                </button>
            </div>

            <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)}>
                <h2 style={{ marginBottom: "20px", color: "var(--white)" }}>Ajouter une catégorie</h2>
                <form onSubmit={handleAddCategory} className="category-form">
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Nom de la catégorie"
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "16px",
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            background: "var(--bg-main)",
                            color: "var(--white)",
                        }}
                    />
                    <button className="edit-button" type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px" }}>
                        Ajouter
                    </button>
                </form>
            </Modal>

            <Modal isOpen={isMovieModalOpen} onClose={() => setIsMovieModalOpen(false)}>
                <div style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "10px" }}>
                    <MovieForm onSuccess={() => {
                        setIsMovieModalOpen(false);
                        fetchStats();
                    }} />
                </div>
            </Modal>
        </div>
    );
}

export default AdminDashboard;
