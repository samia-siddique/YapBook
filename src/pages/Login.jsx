import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link to="/" className="auth-logo">
          <span>Yap</span>book
        </Link>

        <div className="auth-heading">
          <p className="auth-eyebrow">WELCOME BACK ✦</p>
          <h1>Ready to yap?</h1>
          <p>Log in and get back to your little corner of the internet.</p>
        </div>

        <form className="auth-form">
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Your password"
            />
          </label>

          <button type="submit">Log in →</button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;