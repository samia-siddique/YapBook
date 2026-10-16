import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPage.css";

const stickers = [
  { className: "sticker-star", content: "✳" },
  { className: "sticker-smile", content: "☻" },
  { className: "sticker-heart", content: "♥" },
  { className: "sticker-sparkle", content: "✦" },
];

const pageContent = {
  login: {
    title: "your brain",
    highlight: "37 tabs",
    ending: "open.",
    description:
      "Give every thought, late-night idea, and random little obsession a place to live.",
    welcome: "WELCOME BACK",
    heading: "pick up where",
    headingEnd: "your mind left off.",
    button: "let me in",
    switchText: "New to your little corner?",
    switchLink: "Make it yours ↗",
    switchPath: "/signup",
    note: "things i want to do someday...",
  },

  signup: {
    title: "a place for",
    highlight: "your chaos",
    ending: "starts here.",
    description:
      "Collect your thoughts, save your big ideas, and make a little space for everything you are.",
    welcome: "NICE TO MEET YOU",
    heading: "your own little",
    headingEnd: "corner of the internet.",
    button: "create my space",
    switchText: "Already have a YapBook?",
    switchLink: "Log in ↗",
    switchPath: "/login",
    note: "ideas i refuse to forget...",
  },
};

function AuthPage({ mode = "login" }) {
  const isSignup = mode === "signup";
  const content = pageContent[mode] ?? pageContent.login;

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const password = formData.get("password");

    const endpoint = isSignup ? "signup" : "login";

    const body = isSignup
      ? { username: name, email, password }
      : { email, password };

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    try {
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      alert(data.message);

      navigate("/dashboard");
    } catch (error) {
      alert(error.message || "Could not connect to YapBook.");
    }
  }

  return (
    <main className="auth-page">
      <nav className="auth-nav">
        <Link to="/" className="brand" aria-label="YapBook home">
          yapbook<span>✳</span>
        </Link>

        <Link to={content.switchPath} className="nav-link">
          {isSignup ? "Already one of us?" : "New here?"}
          <span>{isSignup ? "Log in ↗" : "Join us ↗"}</span>
        </Link>
      </nav>

      <section className="auth-layout">
        <div className="auth-intro">
          <h1>
            {content.title}
            <br />
            <span className="highlight">{content.highlight}</span>
            <br />
            {content.ending}
          </h1>

          <p className="intro-copy">{content.description}</p>

          <div className="sticker-stage">
            {stickers.map((sticker) => (
              <span
                key={sticker.className}
                className={`sticker ${sticker.className}`}
                aria-hidden="true"
              >
                {sticker.content}
              </span>
            ))}

            <article className="note-preview">
              <div className="note-top">
                <span>UNTITLED THOUGHT #028</span>
                <span aria-hidden="true">↗</span>
              </div>

              <h2>{content.note}</h2>

              <div className="note-tags">
                <span>big dreams</span>
                <span>3:17 am</span>
              </div>

              <p className="note-scribble">~ just saying ~</p>
            </article>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="form-heading">
            <p>{content.welcome}</p>

            <h2>
              {content.heading}
              <br />
              {content.headingEnd}
            </h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <label htmlFor="name">Your name</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="What should we call you?"
                  autoComplete="name"
                  required
                />
              </>
            )}

            <label htmlFor="email">Email address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <div className="password-label">
              <label htmlFor="password">Password</label>

              {!isSignup && <Link to="/forgot-password">Forgot?</Link>}
            </div>

            <input
              id="password"
              name="password"
              type="password"
              placeholder={
                isSignup ? "Create a password" : "Your secret password"
              }
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              required
            />

            <button type="submit" className="auth-submit">
              {content.button}
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <p className="auth-switch">
            {content.switchText}{" "}
            <Link to={content.switchPath}>{content.switchLink}</Link>
          </p>

          <p className="form-footnote">
            MADE FOR ALL YOUR LITTLE YAPS <span>♡</span>
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
