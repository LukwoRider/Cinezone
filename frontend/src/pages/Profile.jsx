import { useState, useRef } from "react";
import { FiCamera } from "react-icons/fi";
import "../styles/Profile.css";
import { useToast } from "../contexts/ToastContext";

function Profile() {
  const token = localStorage.getItem("token");
  const { showToast } = useToast();

  const [user, setUser] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    return stored
      ? { firstname: stored.firstname, lastname: stored.lastname, email: stored.email, avatar: stored.avatar || null }
      : { firstname: "", lastname: "", email: "", avatar: null };
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:3000/auth/profile/avatar", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...JSON.parse(localStorage.getItem("user")), avatar: data.avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser((prev) => ({ ...prev, avatar: data.avatar }));
        showToast("Photo de profil mise à jour !", "success");
      } else {
        showToast(data.error || "Erreur lors de l'upload", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur serveur", "error");
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    return `${(user.firstname || "")[0] || ""}${(user.lastname || "")[0] || ""}`.toUpperCase();
  };
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstname: user.firstname, lastname: user.lastname, email: user.email }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser((prev) => ({ ...prev, ...data.user }));
      } else {
        showToast(data.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur serveur", "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("Les nouveaux mots de passe ne correspondent pas !", "error");
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
        showToast(data.message, "success");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast(data.error, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur serveur", "error");
    }
  };

  return (
    <div className="profile-container">
      <h2>Mon Profil</h2>

      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
          {user.avatar ? (
            <img
              src={`http://localhost:3000${user.avatar}`}
              alt="Avatar"
              className="profile-avatar-img"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {getInitials()}
            </div>
          )}
          <div className="profile-avatar-overlay">
            <FiCamera size={20} />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
        <p className="profile-avatar-hint">
          {uploading ? "Upload en cours..." : "Cliquez pour changer la photo"}
        </p>
      </div>

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
