import { useMemo, useState } from "react";
import "./styles.css";

const TYPES = [
  { id: "planen", label: "Planen", icon: "◉", color: "#ff6a00", bp: 12 },
  { id: "fuehlen", label: "Fühlen", icon: "♥", color: "#7b2cff", bp: 8 },
  { id: "denken", label: "Denken", icon: "⌘", color: "#2367ff", bp: 10 },
  { id: "musik", label: "Musik", icon: "♪", color: "#00c7d9", bp: 6 },
  { id: "location", label: "Location", icon: "●", color: "#ff6a00", bp: 7 },
  { id: "body", label: "Body", icon: "⚡", color: "#ffb000", bp: 5 },
];

const STORAGE = "emotion-ledger-events-v3";

function nowTime(ts) {
  return new Date(ts).toLocaleTimeString("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [tab, setTab] = useState("log");
  const [type, setType] = useState("planen");
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem(STORAGE);
    return saved ? JSON.parse(saved) : [];
  });

  const selected = TYPES.find((t) => t.id === type);

  function saveEvent() {
    const next = [
      {
        id: crypto.randomUUID(),
        type,
        timestamp: Date.now(),
      },
      ...events,
    ];
    setEvents(next);
    localStorage.setItem(STORAGE, JSON.stringify(next));

    if (navigator.vibrate) navigator.vibrate(20);
  }

  const eventList = events.length
    ? events
    : [
        { id: "1", type: "planen", timestamp: Date.now() - 1000 * 60 * 40 },
        { id: "2", type: "fuehlen", timestamp: Date.now() - 1000 * 60 * 120 },
        { id: "3", type: "denken", timestamp: Date.now() - 1000 * 60 * 60 * 20 },
        { id: "4", type: "musik", timestamp: Date.now() - 1000 * 60 * 60 * 26 },
        { id: "5", type: "location", timestamp: Date.now() - 1000 * 60 * 60 * 31 },
      ];

  const totalBP = useMemo(() => {
    return eventList.reduce((sum, e) => {
      const t = TYPES.find((x) => x.id === e.type);
      return sum + (t?.bp || 0);
    }, 0);
  }, [eventList]);

  return (
    <main className="shell">
      <section className="app">
        <div className="ambient ambient-purple" />
        <div className="ambient ambient-orange" />

        {tab === "log" && (
          <Screen>
            <button className="download">↓</button>

            <div className="logoWrap">
              <img src="/logo.png" className="logo" alt="Emotion-Ledger" />
            </div>

            <div className="pill">✨ One tap. One timestamp.</div>

            <h1 className="heroTitle">
              Mein <span>BI-Moment</span>
            </h1>

            <label className="selectBox">
              <span className="typeIcon" style={{ color: selected.color }}>
                {selected.icon}
              </span>

              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              <span className="chevron">⌄</span>
            </label>

            <div className="orbZone">
              <button className="orb" onClick={saveEvent}>
                +
              </button>
              <p>Event speichern</p>
            </div>
          </Screen>
        )}

        {tab === "wallet" && (
          <Screen>
            <div className="screenHeader">
              <h2>Wallet</h2>
              <button className="export">↓ Export</button>
            </div>

            <div className="balanceRow">
              <div>
                <p className="muted">Balance</p>
                <div className="balance">
                  {totalBP.toLocaleString("de-AT")} <span>BP</span>
                </div>
                <p className="muted">≈ {(totalBP / 100).toFixed(2).replace(".", ",")} €</p>
              </div>
              <div className="coin">◎</div>
            </div>

            <Card>
              <div className="cardHead">
                <h3>Recent Events</h3>
                <b>{eventList.length}</b>
              </div>

              {eventList.slice(0, 5).map((e) => {
                const t = TYPES.find((x) => x.id === e.type);
                return (
                  <div className="eventRow" key={e.id}>
                    <span className="roundIcon" style={{ color: t.color, borderColor: t.color }}>
                      {t.icon}
                    </span>
                    <div>
                      <strong>{t.label}</strong>
                      <small>Heute, {nowTime(e.timestamp)}</small>
                    </div>
                    <em>+{t.bp} BP</em>
                  </div>
                );
              })}
            </Card>
          </Screen>
        )}

        {tab === "dashboard" && (
          <Screen>
            <div className="screenHeader">
              <h2>Dashboard</h2>
              <button className="period">Diese Woche⌄</button>
            </div>

            <Card>
              <h3>Übersicht</h3>
              <div className="dashboardGrid">
                <div className="donut">
                  <div>
                    <b>{eventList.length}</b>
                    <span>Events</span>
                  </div>
                </div>
                <div className="legend">
                  {TYPES.slice(0, 5).map((t, i) => (
                    <p key={t.id}>
                      <i style={{ background: t.color }} />
                      {t.label}
                      <span>{[35, 25, 20, 10, 10][i]}%</span>
                    </p>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <h3>Aktivität</h3>
              <div className="bars">
                {[12, 22, 13, 20, 29, 15, 4].map((h, i) => (
                  <div key={i}>
                    <span style={{ height: h * 3 }} />
                    <small>{["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i]}</small>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="streak">
                <strong>🔥 7 Tage in Folge</strong>
                <small>Keep it going!</small>
              </div>
              <div className="dots">
                {[1, 2, 3, 4, 5].map((d) => (
                  <span key={d}>✓</span>
                ))}
                <span className="empty" />
                <span className="empty" />
              </div>
            </Card>
          </Screen>
        )}

        {tab === "settings" && (
          <Screen>
            <h2 className="settingsTitle">Settings</h2>

            <Card>
              <div className="profile">
                <div className="avatar">●</div>
                <div>
                  <strong>Peter</strong>
                  <small>Premium User</small>
                </div>
                <span>›</span>
              </div>
            </Card>

            <p className="sectionLabel">Einstellungen</p>
            <Card>
              {["Kategorien verwalten", "Erinnerungen", "Export / Backup", "Passwort & Sicherheit", "App-Einstellungen"].map((x) => (
                <div className="settingsRow" key={x}>
                  <span>{x}</span>
                  <em>›</em>
                </div>
              ))}
            </Card>

            <p className="sectionLabel">Über</p>
            <Card>
              {["Über Emotion-Ledger", "Hilfe & Support"].map((x) => (
                <div className="settingsRow" key={x}>
                  <span>{x}</span>
                  <em>›</em>
                </div>
              ))}
            </Card>
          </Screen>
        )}

        <nav className="tabbar">
          <Tab active={tab === "log"} onClick={() => setTab("log")} icon="＋" label="Log" />
          <Tab active={tab === "wallet"} onClick={() => setTab("wallet")} icon="▣" label="Wallet" />
          <Tab active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon="▥" label="Dashboard" />
          <Tab active={tab === "settings"} onClick={() => setTab("settings")} icon="⚙" label="Settings" />
        </nav>
      </section>
    </main>
  );
}

function Screen({ children }) {
  return <div className="screen">{children}</div>;
}

function Card({ children }) {
  return <div className="card">{children}</div>;
}

function Tab({ active, icon, label, onClick }) {
  return (
    <button className={`tab ${active ? "active" : ""}`} onClick={onClick}>
      <span>{icon}</span>
      <small>{label}</small>
    </button>
  );
}
