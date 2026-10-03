import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <span>Yap</span>book
      </Link>

      <nav className="navbar-links">
        <Link
          to="/"
          className={location.pathname === "/" ? "active" : ""}
        >
          Home
        </Link>

        <Link
          to="/profile"
          className={location.pathname === "/profile" ? "active" : ""}
        >
          Profile
        </Link>

        <Link to="/yap/new" className="navbar-new-yap">
          + New Yap
        </Link>
      </nav>

      <Link to="/profile" className="navbar-avatar">
        S
      </Link>
    </header>
  );
}

export default Navbar;