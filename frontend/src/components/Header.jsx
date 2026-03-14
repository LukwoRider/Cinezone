import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { MdLocalMovies } from "react-icons/md";
import { useState } from "react";
import "../styles/Header.css";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <Link to="/" className="logo" onClick={closeMenu}>
        <MdLocalMovies style={{ verticalAlign: "middle", marginRight: "6px" }} />
        CineZone
      </Link>

      <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        {user?.is_admin === 1 && (
          <Link
            to="/categories"
            className={location.pathname === "/categories" ? "active" : ""}
            onClick={closeMenu}
          >
            Catégories
          </Link>
        )}

        {user && (
          <Link
            to="/profile"
            className={`nav-profile-link ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={closeMenu}
          >
            {user.avatar ? (
              <img
                src={`http://localhost:3000${user.avatar}`}
                alt="Avatar"
                className="nav-avatar"
              />
            ) : (
              <span className="nav-avatar-placeholder">
                {`${(user.firstname || "")[0] || ""}${(user.lastname || "")[0] || ""}`.toUpperCase()}
              </span>
            )}
            Profil
          </Link>
        )}

        {user ? (
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} />
          </button>
        ) : (
          <Link
            to="/login"
            className={location.pathname === "/login" ? "active" : ""}
            onClick={closeMenu}
          >
            Connexion
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
