import { useState } from "react";
import "./styles.css";

const TYPES = ["Denken", "Fühlen", "Planen", "Musik", "Location", "Body"];

export default function App() {
  const [type, setType] = useState("Planen");

  return (
    <div className="app">

      {/* BACKGROUND */}
      <div className="bg" />

      {/* HEADER */}
      <div className="header">
        <img src="/logo.png" className="logo" />
        <div className="export">⬇</div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="badge">✨ One tap. One timestamp.</div>

        <h1>
          Mein <span className="gradient">BI-Moment</span>
        </h1>

        <div className="dropdown">
          <span>{type}</span>
          <span>⌄</span>
        </div>
      </div>

      {/* BUTTON */}
      <div className="cta-wrapper">
        <div className="cta">
          +
        </div>
        <div className="cta-label">Event speichern</div>
      </div>

      {/* NAV */}
      <div className="nav">
        <div className="nav-item active">
          <div>＋</div>
          <span>Log</span>
        </div>
        <div className="nav-item">
          <div>▢</div>
          <span>Wallet</span>
        </div>
        <div className="nav-item">
          <div>▤</div>
          <span>Dashboard</span>
        </div>
        <div className="nav-item">
          <div>⚙</div>
          <span>Settings</span>
        </div>
      </div>

    </div>
  );
}
