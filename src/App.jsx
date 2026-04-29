import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Wallet, BarChart3, Settings, Download, ChevronDown, Flame, User, Bell, Lock, Info, HelpCircle, ListChecks, MapPin, Music, Heart, Brain, Compass, Dumbbell, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'emotion-ledger-events-v3';
const CATEGORIES = [
  { id: 'planen', label: 'Planen', points: 12, color: '#ff7a18', icon: Compass },
  { id: 'denken', label: 'Denken', points: 10, color: '#396dff', icon: Brain },
  { id: 'fuehlen', label: 'Fühlen', points: 8, color: '#7b2dff', icon: Heart },
  { id: 'musik', label: 'Musik', points: 6, color: '#17d6d6', icon: Music },
  { id: 'location', label: 'Location', points: 7, color: '#ff6a00', icon: MapPin },
  { id: 'body', label: 'Body', points: 9, color: '#f7b52c', icon: Dumbbell },
];

const seedEvents = () => {
  const now = Date.now();
  const hrs = [0.5, 2, 5, 13, 28, 35, 49, 62, 80, 110, 130, 150];
  return hrs.map((h, i) => ({ id: crypto.randomUUID(), typeId: CATEGORIES[i % CATEGORIES.length].id, ts: now - h * 3600000 }));
};

function loadEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedEvents(); } catch { return seedEvents(); }
}
function fmtTime(ts) { return new Intl.DateTimeFormat('de-AT', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts)); }
function fmtDay(ts) { return new Intl.DateTimeFormat('de-AT', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date(ts)); }
function isToday(ts) { return new Date(ts).toDateString() === new Date().toDateString(); }
function exportCsv(events) {
  const rows = ['timestamp,event_type,event_label,points'];
  events.forEach(e => { const c = CATEGORIES.find(x => x.id === e.typeId); rows.push(`${new Date(e.ts).toISOString()},${e.typeId},${c?.label || ''},${c?.points || 0}`); });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'emotion-ledger-export.csv'; a.click(); URL.revokeObjectURL(url);
}

export default function App() {
  const [tab, setTab] = useState('log');
  const [selected, setSelected] = useState('planen');
  const [events, setEvents] = useState(loadEvents);
  const [range, setRange] = useState('week');

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(events)), [events]);
  const cat = CATEGORIES.find(c => c.id === selected) || CATEGORIES[0];
  const totalPoints = events.reduce((s, e) => s + (CATEGORIES.find(c => c.id === e.typeId)?.points || 0), 0);
  const filtered = useMemo(() => {
    const days = range === 'week' ? 7 : range === 'month' ? 30 : range === 'year' ? 365 : 9999;
    const min = Date.now() - days * 86400000;
    return events.filter(e => e.ts >= min).sort((a,b) => b.ts-a.ts);
  }, [events, range]);

  function addEvent() {
    if (navigator.vibrate) navigator.vibrate(18);
    setEvents([{ id: crypto.randomUUID(), typeId: selected, ts: Date.now() }, ...events]);
  }

  return (
    <main className="shell">
      <div className="ambient" />
      <section className="phone">
        <StatusBar />
        {tab === 'log' && <LogScreen cat={cat} selected={selected} setSelected={setSelected} addEvent={addEvent} events={events} />}
        {tab === 'wallet' && <WalletScreen events={events} totalPoints={totalPoints} />}
        {tab === 'dashboard' && <DashboardScreen events={filtered} range={range} setRange={setRange} />}
        {tab === 'settings' && <SettingsScreen />}
        <BottomNav tab={tab} setTab={setTab} />
      </section>
    </main>
  );
}

function StatusBar(){ return <div className="status"><span>9:41</span><span className="status-icons">▮▮▮  Wi‑Fi  ▰</span></div> }

function LogScreen({ cat, selected, setSelected, addEvent, events }) {
  const Icon = cat.icon;
  return <div className="screen log-screen">
    <button className="download" onClick={() => exportCsv(events)}><Download size={22}/></button>
    <div className="logo-wrap"><img src="/logo.png" alt="Emotion-Ledger" /></div>
    <div className="pill">✨ One tap. One timestamp.</div>
    <h1 className="hero-title">Mein <span>BI-Moment</span></h1>
    <label className="select-card">
      <span className="icon-ring"><Icon size={22}/></span>
      <select value={selected} onChange={e => setSelected(e.target.value)}>
        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <ChevronDown className="chev" size={20}/>
    </label>
    <div className="orb-zone">
      <button className="orb" onClick={addEvent}><Plus size={58}/></button>
      <p>Event speichern</p>
    </div>
  </div>
}

function WalletScreen({ events, totalPoints }) {
  const recent = events.slice(0, 7);
  return <div className="screen wallet-screen">
    <div className="top-row"><h2>Wallet</h2><button onClick={() => exportCsv(events)}><Download size={16}/> Export</button></div>
    <div className="balance-grid"><div><p>Balance</p><strong>{totalPoints.toLocaleString('de-AT')} <span>BP</span></strong><small>≈ {(totalPoints/100).toFixed(2).replace('.', ',')} €</small></div><div className="coin">◎</div></div>
    <div className="glass-card"><div className="card-head"><b>Recent Events</b><em>{events.length}</em></div>{recent.map(e => <EventRow key={e.id} event={e}/>)}</div>
  </div>
}
function EventRow({ event }){ const c=CATEGORIES.find(x=>x.id===event.typeId)||CATEGORIES[0]; const Icon=c.icon; return <div className="event-row"><span className="small-icon" style={{color:c.color, boxShadow:`0 0 22px ${c.color}55`}}><Icon size={20}/></span><div><b>{c.label}</b><small>{isToday(event.ts)?'Heute':'Gestern'}, {fmtTime(event.ts)}</small></div><strong>+{c.points} BP</strong></div> }

function DashboardScreen({ events, range, setRange }) {
  const counts = CATEGORIES.map(c => ({...c, count: events.filter(e=>e.typeId===c.id).length})).filter(c=>c.count>0);
  const total = events.length || 1;
  let offset = 0;
  const gradients = counts.map(c => { const start=offset/total*100; offset += c.count; const end=offset/total*100; return `${c.color} ${start}% ${end}%`; }).join(', ');
  const bars = [3,7,5,9,12,6,1];
  return <div className="screen dashboard-screen">
    <div className="top-row"><h2>Dashboard</h2><select className="range" value={range} onChange={e=>setRange(e.target.value)}><option value="week">Diese Woche</option><option value="month">Dieser Monat</option><option value="year">Dieses Jahr</option><option value="all">Alle</option></select></div>
    <div className="glass-card overview"><b>Übersicht</b><div className="donut-area"><div className="donut" style={{background:`conic-gradient(${gradients || '#7b2dff 0 100%'})`}}><span>{events.length}<small>Events</small></span></div><div className="legend">{(counts.length?counts:CATEGORIES.slice(0,5)).slice(0,5).map(c=><p key={c.id}><i style={{background:c.color}}/> {c.label}<em>{Math.round((c.count||0)/total*100)}%</em></p>)}</div></div></div>
    <div className="glass-card activity"><b>Aktivität</b><div className="bars">{bars.map((h,i)=><span key={i} style={{height: `${28+h*6}px`}}><small>{['Mo','Di','Mi','Do','Fr','Sa','So'][i]}</small></span>)}</div></div>
    <div className="glass-card streak"><Flame color="#ff7a18"/><div><b>7 Tage in Folge</b><small>Keep it going!</small></div><div className="checks">{[1,1,1,1,1,0,0].map((v,i)=> v?<CheckCircle2 key={i} size={24} fill="#ff7a18" color="#ff7a18"/>:<span key={i}/>)}</div></div>
  </div>
}

function SettingsScreen(){
 const items=[['Kategorien verwalten',ListChecks],['Erinnerungen',Bell],['Export / Backup',Download],['Passwort & Sicherheit',Lock],['App-Einstellungen',Settings]];
 return <div className="screen settings-screen"><h2>Settings</h2><div className="profile"><span><User size={28}/></span><div><b>Peter</b><small>Premium User</small></div><em>›</em></div><p className="section-label">Einstellungen</p><div className="glass-list">{items.map(([t,Icon])=><div key={t}><Icon size={18}/><span>{t}</span><em>›</em></div>)}</div><p className="section-label">Über</p><div className="glass-list"><div><Info size={18}/><span>Über Emotion-Ledger</span><em>›</em></div><div><HelpCircle size={18}/><span>Hilfe & Support</span><em>›</em></div></div></div>
}

function BottomNav({ tab, setTab }) {
  const items = [['log','Log',Plus],['wallet','Wallet',Wallet],['dashboard','Dashboard',BarChart3],['settings','Settings',Settings]];
  return <nav className="bottom-nav">{items.map(([id,label,Icon]) => <button key={id} onClick={()=>setTab(id)} className={tab===id?'active':''}><Icon size={24}/><span>{label}</span></button>)}</nav>
}
