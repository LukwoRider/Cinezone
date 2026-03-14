import { db } from "../db/database.js";

// Retrieves a list of all users from the database
export const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, firstname, lastname, email, is_admin, avatar FROM users ORDER BY id DESC"
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs", details: err.message });
    }
};

// Deletes a specific user by ID (prevents a user from deleting themselves)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (Number(id) === req.user.id) {
            return res.status(403).json({ error: "Vous ne pouvez pas supprimer votre propre compte." });
        }

        const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur", details: err.message });
    }
};
