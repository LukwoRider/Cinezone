import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/database.js";

// --- REGISTER ---
export const register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (firstname, lastname, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [firstname, lastname, email, passwordHash]
    );

    res.status(201).json({ message: "Compte créé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- LOGIN ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email ou mot de passe manquant" });
  }

  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        is_admin: user.is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        is_admin: user.is_admin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- UPDATE PROFILE ---
export const updateProfile = async (req, res) => {
  const userId = req.user.id; // récupéré depuis le middleware authenticate
  const { firstname, lastname, email } = req.body;

  if (!firstname || !lastname || !email) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    await db.query(
      "UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE id = ?",
      [firstname, lastname, email, userId]
    );

    res.json({ message: "Profil mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// --- CHANGE PASSWORD ---
export const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (!rows.length) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const user = rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!valid) return res.status(400).json({ error: "Mot de passe actuel incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, userId]);

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
