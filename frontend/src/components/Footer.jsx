import "../styles/Footer.css";

function Footer() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <footer className="footer">
        <div className="footer-content">
            <p>© {new Date().getFullYear()} Cinezone. Tous droits réservés.</p>
            <div className="footer-links">
            <a href="/">Accueil</a>

            {user?.is_admin === 1 && (
                <a href="/categories">Catégories</a>
            )}

            <a href="/profile">Profil</a>
            </div>
        </div>
        </footer>
    );
}

export default Footer;
