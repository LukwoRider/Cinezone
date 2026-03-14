import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdDelete, MdPerson } from "react-icons/md";
import "../../styles/AdminUsers.css";

function AdminUsers() {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        if (!currentUser || currentUser.is_admin !== 1) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    const fetchUsers = () => {
        setLoading(true);
        fetch("http://localhost:3000/users", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                if (!res.ok) {
                    const errorDetails = await res.json();
                    throw new Error(errorDetails.error || "Failed to fetch users");
                }
                return res.json();
            })
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error(err);
                setUsers([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId, name) => {
        if (userId === currentUser.id) {
            alert("Vous ne pouvez pas supprimer votre propre compte.");
            return;
        }

        if (!window.confirm(`Voulez-vous vraiment supprimer l'utilisateur "${name}" ?`)) return;

        try {
            const res = await fetch(`http://localhost:3000/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Erreur lors de la suppression de l'utilisateur");

            fetchUsers();
            alert(`Utilisateur "${name}" supprimé avec succès.`);
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return <p style={{ textAlign: "center", marginTop: 100, color: "#ccc" }}>Chargement des utilisateurs...</p>;
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            (u.firstname && u.firstname.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.lastname && u.lastname.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole =
            roleFilter === "all" ? true :
                roleFilter === "admin" ? u.is_admin === 1 :
                    u.is_admin === 0;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="admin-users-page">
            <div className="admin-users-header">
                <button className="back-button" onClick={() => navigate("/admin")}>
                    <MdArrowBack /> Retour au Dashboard
                </button>
                <h1>Gestion des utilisateurs</h1>
                <div style={{ width: 150 }}></div> {/* Spacer for flexbox balance */}
            </div>

            <div className="admin-users-controls">
                <input
                    type="text"
                    placeholder="Rechercher par nom, prénom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="users-search-input"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="users-role-filter"
                >
                    <option value="all">Tous les rôles</option>
                    <option value="user">Utilisateurs</option>
                    <option value="admin">Administrateurs</option>
                </select>
            </div>

            <div className="users-list-container">
                {filteredUsers.length === 0 ? (
                    <p className="no-users">
                        {users.length === 0 ? "Aucun utilisateur trouvé." : "Aucun utilisateur ne correspond à vos filtres."}
                    </p>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Utilisateur</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th style={{ textAlign: "right", paddingRight: "40px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell-info">
                                            {u.avatar ? (
                                                <img
                                                    src={`http://localhost:3000${u.avatar}`}
                                                    alt={`${u.firstname} ${u.lastname}`}
                                                    className="user-avatar"
                                                />
                                            ) : (
                                                <div className="user-avatar placeholder">
                                                    <MdPerson />
                                                </div>
                                            )}
                                            <span className="user-name-text">
                                                {u.firstname} {u.lastname}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: "var(--text-info)" }}>{u.email}</td>
                                    <td>
                                        <span className={`user-badge ${u.is_admin === 1 ? 'admin' : 'user'}`}>
                                            {u.is_admin === 1 ? 'Administrateur' : 'Utilisateur'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right", paddingRight: "36px" }}>
                                        {u.id !== currentUser.id && (
                                            <button
                                                className="action-button delete"
                                                onClick={() => handleDeleteUser(u.id, `${u.firstname} ${u.lastname}`)}
                                                title="Supprimer cet utilisateur"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminUsers;
