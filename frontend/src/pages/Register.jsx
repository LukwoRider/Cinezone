import { useState } from "react";
import { register } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";
import "../styles/global.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const res = await register(form);

    if (res.message) {
      setSuccess("Compte créé avec succès 🎉");
      setTimeout(() => navigate("/login"), 1200);
    } else {
      setError(res.error || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Inscription</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="firstname"
            placeholder="Prénom"
            value={form.firstname}
            onChange={handleChange}
            required
          />

          <input
            name="lastname"
            placeholder="Nom"
            value={form.lastname}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit">S'inscrire</button>
        </form>

        <div className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
