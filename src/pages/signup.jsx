import { Link } from "react-router-dom";
import "./Signup.css";

function Signup() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link to="/" className="auth-logo">
          <span>Yap</span>book
        </Link>

        <div className="auth-heading">
          <p className="auth-eyebrow">WELCOME TO YAPBOOK ✦</p>
          <h1>Let's get yapping.</h1>
          <p>Create your little corner of the internet.</p>
        </div>

        <form className="auth-form">
          <label>
            Username
            <input
              type="text"
              placeholder="yourusername"
            />
          </label>

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
              placeholder="Create a password"
            />
          </label>

          <button type="submit">Create account →</button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;