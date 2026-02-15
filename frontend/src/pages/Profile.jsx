import { useState } from "react";
import "../styles/Profile.css";

function Profile() {
  const token = localStorage.getItem("token");

  // ⚡ State initialisé directement depuis localStorage
  const [user, setUser] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    return stored
      ? { firstname: stored.firstname, lastname: stored.lastname, email: stored.email }
      : { firstname: "", lastname: "", email: "" };
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🔹 Inputs
  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  // --- Mettre à jour le profil ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  // --- Changer le mot de passe ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas !");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur");
    }
  };

  return (
    <div className="profile-container">
      <h2>Mon Profil</h2>

      <form className="profile-form" onSubmit={handleSaveProfile}>
        <label>Prénom</label>
        <input
          name="firstname"
          value={user.firstname}
          onChange={handleChange}
          placeholder="Prénom"
        />

        <label>Nom</label>
        <input
          name="lastname"
          value={user.lastname}
          onChange={handleChange}
          placeholder="Nom"
        />

        <label>Email</label>
        <input
          name="email"
          type="email"
          value={user.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <button className="edit-button button-profil" type="submit">Sauvegarder</button>
      </form>

      <h3>Modifier le mot de passe</h3>

      <form className="profile-form" onSubmit={handleChangePassword}>
        <label>Mot de passe actuel</label>
        <input
          name="currentPassword"
          type="password"
          value={passwords.currentPassword}
          onChange={handlePasswordChange}
          placeholder="Mot de passe actuel"
        />

        <label>Nouveau mot de passe</label>
        <input
          name="newPassword"
          type="password"
          value={passwords.newPassword}
          onChange={handlePasswordChange}
          placeholder="Nouveau mot de passe"
        />

        <label>Confirmer le nouveau mot de passe</label>
        <input
          name="confirmPassword"
          type="password"
          value={passwords.confirmPassword}
          onChange={handlePasswordChange}
          placeholder="Confirmer le nouveau mot de passe"
        />

        <button className="edit-button button-profil" type="submit">Changer le mot de passe</button>
      </form>
    </div>
  );
}

export default Profile;
