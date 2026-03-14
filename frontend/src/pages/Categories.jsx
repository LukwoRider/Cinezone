import { useState, useEffect } from "react";
import "../styles/Categories.css";
import Modal from "../components/Modal";
import { FaFolderOpen } from "react-icons/fa";
import "../styles/global.css";
import { useToast } from "../contexts/ToastContext";
import { useConfirm } from "../contexts/ConfirmContext";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const fetchCategories = () => {
    setLoading(true);
    fetch("http://localhost:3000/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    setEditingCategory(category);
    setNameInput(category ? category.name : "");
    setIsModalOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      const url = editingCategory
        ? `http://localhost:3000/categories/${editingCategory.id}`
        : "http://localhost:3000/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setIsModalOpen(false);
      fetchCategories();
      showToast(editingCategory ? "Catégorie modifiée !" : "Catégorie ajoutée !", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async (category) => {
    const isConfirmed = await confirm(`Supprimer "${category.name}" ?`);
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/categories/${category.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }
      fetchCategories();
      showToast(`Catégorie "${category.name}" supprimée.`, "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (loading) return <p className="status">Chargement...</p>;
  if (error) return <p className="status error">Erreur : {error}</p>;

  return (
    <div className="categories-page">
      <h1 className="category-title">
        <FaFolderOpen />
        Gestion des catégories
      </h1>

      <button className="edit-button" onClick={() => openModal()}>
        + Ajouter une catégorie
      </button>

      <ul className="categories-list">
        {categories.map(cat => (
          <li key={cat.id} className="category-item">
            <span>{cat.name}</span>
            <div className="button-contain">
              <button className="edit-button" onClick={() => openModal(cat)}>Modifier</button>
              <button className="delete-button" onClick={() => handleDelete(cat)}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>{editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}</h2>
        <form onSubmit={handleSubmit} className="category-form">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Nom de la catégorie"
            required
          />
          <button className="edit-button" type="submit">
            {editingCategory ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default Categories;