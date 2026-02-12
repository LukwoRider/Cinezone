import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import "../styles/Header.css";
import { MdLocalMovies } from "react-icons/md";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        <MdLocalMovies style={{ verticalAlign: "middle", marginRight: "6px" }} />
        CineZone
      </Link>


      <nav className="nav">
      {user?.is_admin === 1 && (
        <Link
          to="/categories"
          className={location.pathname === "/categories" ? "active" : ""}
        >
          Catégories
        </Link>
      )}

        {user && (
          <Link
            to="/profile"
            className={location.pathname === "/profile" ? "active" : ""}
          >
            Profil
          </Link>
        )}

        {user ? (
          <button className="logout-btn" onClick={handleLogout} title="Se déconnecter">
            ⏻
          </button>
        ) : (
          <Link
            to="/login"
            className={location.pathname === "/login" ? "active" : ""}
          >
            Connexion
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
