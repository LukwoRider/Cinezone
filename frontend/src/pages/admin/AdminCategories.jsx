import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdAdd, MdEdit, MdDelete, MdCategory } from "react-icons/md";
import "../../styles/AdminCategories.css";
import Modal from "../../components/Modal";

function AdminCategories() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [nameInput, setNameInput] = useState("");

    useEffect(() => {
        if (!user || user.is_admin !== 1) {
            navigate("/");
        }
    }, [user, navigate]);

    const fetchCategories = () => {
        setLoading(true);
        fetch("http://localhost:3000/categories")
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDeleteCategory = async (categoryId, name) => {
        if (!window.confirm(`Voulez-vous vraiment supprimer la catégorie "${name}" ?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/categories/${categoryId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Erreur lors de la suppression de la catégorie");

            fetchCategories();
            alert(`Catégorie "${name}" supprimée avec succès.`);
        } catch (err) {
            alert(err.message);
        }
    };

    const openModal = (category = null) => {
        setEditingCategory(category);
        setNameInput(category ? category.name : "");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nameInput.trim()) return;

        try {
            const url = editingCategory
                ? `http://localhost:3000/categories/${editingCategory.id}`
                : "http://localhost:3000/categories";
            const method = editingCategory ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: nameInput.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erreur lors de la sauvegarde");
            }

            setIsModalOpen(false);
            fetchCategories();
            alert(editingCategory ? "Catégorie modifiée !" : "Catégorie ajoutée !");
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return <p style={{ textAlign: "center", marginTop: 100, color: "#ccc" }}>Chargement des catégories...</p>;
    }

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-categories-page">
            <div className="admin-categories-header">
                <button className="back-button" onClick={() => navigate("/admin")}>
                    <MdArrowBack /> Retour au Dashboard
                </button>
                <h1>Gestion des catégories</h1>
                <button className="add-button" onClick={() => openModal(null)}>
                    <MdAdd /> Ajouter une catégorie
                </button>
            </div>

            <div className="admin-categories-search">
                <input
                    type="text"
                    placeholder="Rechercher une catégorie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-search-input"
                />
            </div>

            <div className="categories-list-container">
                {filteredCategories.length === 0 ? (
                    <p className="no-categories">
                        {categories.length === 0 ? "Aucune catégorie trouvée." : "Aucune catégorie ne correspond."}
                    </p>
                ) : (
                    <ul className="categories-list">
                        {filteredCategories.map(cat => (
                            <li key={cat.id} className="category-list-item">
                                <div className="category-info">
                                    <div className="category-icon">
                                        <MdCategory size={24} />
                                    </div>
                                    <div className="category-title">{cat.name}</div>
                                </div>
                                <div className="category-actions">
                                    <button className="action-button edit" onClick={() => openModal(cat)}>
                                        <MdEdit size={18} /> Modifier
                                    </button>
                                    <button className="action-button delete" onClick={() => handleDeleteCategory(cat.id, cat.name)}>
                                        <MdDelete size={18} /> Supprimer
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal Ajout/Modif Catégorie */}
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <h2 style={{ marginBottom: "20px", color: "var(--white)" }}>
                        {editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
                    </h2>
                    <form onSubmit={handleSubmit} className="category-form">
                        <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
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
                            {editingCategory ? "Modifier" : "Ajouter"}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default AdminCategories;
