import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { MdLocalMovies } from "react-icons/md";
import { useState } from "react";
import "../styles/Header.css";

// Application Header component containing navigation and user profile status
function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Log out the current user by clearing local storage and redirecting to login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  // Helper to close mobile menu after navigation
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <Link to={user?.is_admin === 1 ? "/admin" : "/"} className="logo" onClick={closeMenu}>
        <MdLocalMovies style={{ verticalAlign: "middle", marginRight: "6px" }} />
        CineZone
      </Link>

      {/* Mobile menu toggle button */}
      <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        {/* Admin only: Link to switch back to normal user mode (homepage) */}
        {user?.is_admin === 1 && (
          <Link
            to="/"
            className={location.pathname === "/" ? "active" : ""}
            onClick={closeMenu}
          >
            Mode utilisateur
          </Link>
        )}

        {/* Display profile link and avatar if user is logged in */}
        {user && (
          <Link
            to="/profile"
            className={`nav-profile-link ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={closeMenu}
          >
            {user.avatar ? (
              <img
                src={`http://localhost:3300${user.avatar}`}
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

        {/* Display logout button if logged in, otherwise login link */}
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
