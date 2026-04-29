import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Wallet, BarChart3, Settings, Download, Trash2, Brain, Heart, MapPin,
  Activity, Music, Compass, CalendarDays, Zap, TrendingUp, Flame, Clock3,
  Sparkles, RotateCcw
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid
} from 'recharts';

const STORAGE_KEY = 'emotion-ledger-events-v2';
const OLD_STORAGE_KEY = 'emotion-ledger-events-v1';
const TYPES_KEY = 'emotion-ledger-types-v1';
const DEFAULT_TYPES = [
  { id: 'denken', label: 'Denken', icon: 'brain', color: '#9b4dff' },
  { id: 'fuehlen', label: 'Fühlen', icon: 'heart', color: '#ff7a18' },
  { id: 'planen', label: 'Planen', icon: 'compass', color: '#3b82f6' },
  { id: 'musik', label: 'Musik', icon: 'music', color: '#f43f5e' },
  { id: 'location', label: 'Location', icon: 'map', color: '#84cc16' },
  { id: 'body', label: 'Body', icon: 'activity', color: '#eab308' },
];

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function readEvents() {
  const current = read(STORAGE_KEY, null);
  if (current) return current;
  return read(OLD_STORAGE_KEY, []);
}
function dt(ts) { return new Intl.DateTimeFormat('de-AT', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }).format(new Date(ts)); }
function time(ts) { return new Intl.DateTimeFormat('de-AT', { hour:'2-digit', minute:'2-digit' }).format(new Date(ts)); }
function day(ts) { return new Intl.DateTimeFormat('de-AT', { weekday:'short', day:'2-digit', month:'2-digit' }).format(new Date(ts)); }
function isoDay(ts) { return new Date(ts).toISOString().slice(0,10); }
function start(range){
  const d=new Date();
  if(range==='today') d.setHours(0,0,0,0);
  else if(range==='week') d.setDate(d.getDate()-7);
  else if(range==='month') d.setMonth(d.getMonth()-1);
  else if(range==='year') d.setFullYear(d.getFullYear()-1);
  else return 0;
  if(range!=='today') d.setHours(0,0,0,0);
  return d.getTime();
}
function iconFor(name, size=21){
  const p={size,strokeWidth:2.25};
  return name==='brain'?<Brain {...p}/>:name==='heart'?<Heart {...p}/>:name==='compass'?<Compass {...p}/>:name==='music'?<Music {...p}/>:name==='map'?<MapPin {...p}/>:<Activity {...p}/>;
}
function triggerHaptic(){
  try { if (navigator.vibrate) navigator.vibrate(18); } catch {}
}

export default function App(){
  const [types,setTypes]=useState(()=>read(TYPES_KEY, DEFAULT_TYPES));
  const [events,setEvents]=useState(()=>readEvents());
  const [typeId,setTypeId]=useState(()=>DEFAULT_TYPES[0].id);
  const [tab,setTab]=useState('log');
  const [range,setRange]=useState('week');
  const [toast,setToast]=useState('');

  const byId=useMemo(()=>Object.fromEntries(types.map(t=>[t.id,t])),[types]);
  const filtered=useMemo(()=>events.filter(e=>e.timestamp>=start(range)).sort((a,b)=>b.timestamp-a.timestamp),[events,range]);
  const selected=byId[typeId]||types[0];
  const chart=useMemo(()=>Object.entries(filtered.reduce((a,e)=>(a[e.typeId]=(a[e.typeId]||0)+1,a),{})).map(([id,value])=>({name:byId[id]?.label||id,value,color:byId[id]?.color||'#8b5cf6'})).sort((a,b)=>b.value-a.value),[filtered,byId]);
  const advanced=useMemo(()=>buildAdvanced(filtered, byId, range),[filtered,byId,range]);

  useEffect(()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(events)),[events]);
  useEffect(()=>localStorage.setItem(TYPES_KEY,JSON.stringify(types)),[types]);
  useEffect(()=>{ if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js'); },[]);
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(''),1500); return()=>clearTimeout(t); },[toast]);

  const add=(quick=false)=>{
    triggerHaptic();
    setEvents([{id:crypto.randomUUID(),typeId,timestamp:Date.now()},...events]);
    setToast(`${selected?.label || 'Event'} gespeichert`);
    if (quick) setTab('dashboard');
  };
  const del=(id)=>setEvents(events.filter(x=>x.id!==id));
  const exportCsv=()=>{
    const rows=['timestamp,event_type,event_label',...events.map(e=>`${new Date(e.timestamp).toISOString()},${e.typeId},${byId[e.typeId]?.label||''}`)];
    const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='emotion-ledger-export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return <div className="app"><div className="orb one"/><div className="orb two"/><div className="orb three"/>
    <main className="phone">
      <header><img src="/logo.png" className="logo" alt="Emotion-Ledger"/><button className="round" onClick={exportCsv} aria-label="CSV Export"><Download size={20}/></button></header>
      <AnimatePresence mode="wait">
        {tab==='log'&&<motion.section key="log" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} className="screen logscreen">
          <p className="eyebrow"><Sparkles size={14}/> One tap. One timestamp.</p>
          <h1 className="hero">Was ist jetzt präsent?</h1>
          <div className="selectWrap" style={{'--accent':selected.color}}><span>{iconFor(selected.icon)}</span><select value={typeId} onChange={e=>setTypeId(e.target.value)}>{types.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
          <button className="pulse" onClick={()=>add(false)} aria-label="Event speichern"><span><Plus size={42}/></span></button>
          <button className="quick" onClick={()=>add(true)}><Zap size={18}/> Quick Log & Dashboard</button>
          <p className="muted center">Jetzt · {dt(Date.now())}</p>
        </motion.section>}

        {tab==='wallet'&&<motion.section key="wallet" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} className="screen">
          <Title title="Wallet" subtitle="Alle Logs chronologisch sortiert."/>
          <Filters range={range} setRange={setRange}/>
          <div className="list">{filtered.map(e=>{const t=byId[e.typeId];return <motion.div layout className="row" key={e.id}><div className="badge" style={{color:t?.color,borderColor:t?.color}}>{iconFor(t?.icon,18)}</div><div><b>{t?.label}</b><small>{dt(e.timestamp)}</small></div><button className="ghost" onClick={()=>del(e.id)}><Trash2 size={17}/></button></motion.div>})}{!filtered.length&&<Empty/>}</div>
        </motion.section>}

        {tab==='dashboard'&&<motion.section key="dashboard" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} className="screen">
          <Title title="Dashboard" subtitle="Patterns, Peaks & Verteilung."/>
          <Filters range={range} setRange={setRange}/>
          <InsightHero advanced={advanced}/>
          <div className="cards"><Stat icon={<Wallet/>} label="Events" value={filtered.length}/><Stat icon={<Flame/>} label="Aktive Tage" value={advanced.activeDays}/></div>
          <Panel title="Verteilung">{chart.length?<ResponsiveContainer width="100%" height={245}><PieChart><Pie data={chart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>{chart.map(c=><Cell key={c.name} fill={c.color}/>)}</Pie><Tooltip contentStyle={tooltipStyle}/></PieChart></ResponsiveContainer>:<Empty/>}<LegendList data={chart}/></Panel>
          <Panel title="Trend pro Tag"><ResponsiveContainer width="100%" height={210}><LineChart data={advanced.dailySeries}><CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false}/><XAxis dataKey="label" stroke="#8f8a9f" tick={{fontSize:11}}/><YAxis stroke="#8f8a9f" allowDecimals={false} width={26}/><Tooltip contentStyle={tooltipStyle}/><Line type="monotone" dataKey="events" stroke="#a855f7" strokeWidth={3} dot={{r:3}} activeDot={{r:6}}/></LineChart></ResponsiveContainer></Panel>
          <Panel title="Peak Hours"><ResponsiveContainer width="100%" height={220}><BarChart data={advanced.hourly}><XAxis dataKey="hour" stroke="#8f8a9f" tick={{fontSize:10}} interval={2}/><YAxis stroke="#8f8a9f" allowDecimals={false} width={24}/><Tooltip contentStyle={tooltipStyle}/><Bar dataKey="events" radius={[8,8,0,0]} fill="#ff7a18"/></BarChart></ResponsiveContainer></Panel>
          <Panel title="Wochen-Heatmap"><Heatmap matrix={advanced.heatmap}/></Panel>
          <Panel title="Live Timeline">{filtered.length?<Timeline events={[...filtered].reverse()} byId={byId}/>:<Empty/>}</Panel>
        </motion.section>}

        {tab==='settings'&&<motion.section key="settings" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} className="screen">
          <Title title="Settings" subtitle="Event-Typen & lokale Daten."/>
          <Panel title="Event-Typen">{types.map(t=><div className="row compact" key={t.id}><div className="badge" style={{color:t.color,borderColor:t.color}}>{iconFor(t.icon,18)}</div><b>{t.label}</b></div>)}</Panel>
          <Panel title="Daten"><button className="danger" onClick={()=>{if(confirm('Alle Events löschen?'))setEvents([])}}><Trash2 size={17}/> Alle Daten löschen</button><button className="secondary" onClick={()=>{setTypes(DEFAULT_TYPES);setToast('Typen zurückgesetzt')}}><RotateCcw size={17}/> Event-Typen zurücksetzen</button></Panel>
        </motion.section>}
      </AnimatePresence>
    </main>
    <AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}>{toast}</motion.div>}</AnimatePresence>
    <nav><Nav tab={tab} setTab={setTab} id="log" icon={<Plus/>} label="Log"/><Nav tab={tab} setTab={setTab} id="wallet" icon={<Wallet/>} label="Wallet"/><Nav tab={tab} setTab={setTab} id="dashboard" icon={<BarChart3/>} label="Dashboard"/><Nav tab={tab} setTab={setTab} id="settings" icon={<Settings/>} label="Settings"/></nav>
  </div>
}

const tooltipStyle={background:'#090b13',border:'1px solid #27203d',borderRadius:14,color:'#fff'};
function buildAdvanced(events, byId, range){
  const days = range==='today'?1:range==='week'?7:range==='month'?30:range==='year'?365:Math.max(14, uniqueDays(events).length || 14);
  const now = new Date();
  const dailySeries=[];
  for(let i=days-1;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); const key=isoDay(d.getTime()); const count=events.filter(e=>isoDay(e.timestamp)===key).length; dailySeries.push({label:new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'2-digit'}).format(d), events:count}); }
  const hourly=Array.from({length:24},(_,h)=>({hour:String(h).padStart(2,'0'),events:0}));
  events.forEach(e=>hourly[new Date(e.timestamp).getHours()].events++);
  const typeCounts=events.reduce((a,e)=>(a[e.typeId]=(a[e.typeId]||0)+1,a),{});
  const topId=Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const peakHour=hourly.reduce((a,b)=>b.events>a.events?b:a,hourly[0]);
  const activeDays=uniqueDays(events).length;
  const heatmap=buildHeatmap(events);
  const topLabel=topId ? byId[topId]?.label || topId : 'Noch offen';
  const avgPerDay=activeDays ? (events.length/activeDays).toFixed(1) : '0.0';
  return {dailySeries,hourly,heatmap,topLabel,peakHour:peakHour.events?`${peakHour.hour}:00`: '—',activeDays,avgPerDay};
}
function uniqueDays(events){ return [...new Set(events.map(e=>isoDay(e.timestamp)))]; }
function buildHeatmap(events){
  const labels=['Mo','Di','Mi','Do','Fr','Sa','So'];
  const matrix=labels.map((label,idx)=>({label,hours:[0,6,12,18].map(h=>({h,count:0,key:`${idx}-${h}`}))}));
  events.forEach(e=>{ const d=new Date(e.timestamp); const dayIdx=(d.getDay()+6)%7; const bucket=Math.floor(d.getHours()/6); matrix[dayIdx].hours[bucket].count++; });
  return matrix;
}
function Title({title,subtitle}){return <div className="title"><h1>{title}</h1><p>{subtitle}</p></div>}
function Filters({range,setRange}){return <div className="filters">{[['today','Heute'],['week','Woche'],['month','Monat'],['year','Jahr'],['all','Alle']].map(([id,l])=><button key={id} className={range===id?'active':''} onClick={()=>setRange(id)}>{l}</button>)}</div>}
function InsightHero({advanced}){return <section className="insight"><div><p><TrendingUp size={16}/> Hauptmuster</p><h2>{advanced.topLabel}</h2></div><div className="miniGrid"><span><Clock3 size={14}/> Peak {advanced.peakHour}</span><span><BarChart3 size={14}/> Ø {advanced.avgPerDay}/Tag</span></div></section>}
function Panel({title,children}){return <section className="panel"><h3>{title}</h3>{children}</section>}
function Stat({icon,label,value}){return <div className="stat">{React.cloneElement(icon,{size:18})}<small>{label}</small><b>{value}</b></div>}
function Empty(){return <div className="empty">Noch keine Daten vorhanden.</div>}
function LegendList({data}){return <div className="legendList">{data.map(d=><span key={d.name}><i style={{background:d.color}}/> {d.name} · {d.value}</span>)}</div>}
function Heatmap({matrix}){ const max=Math.max(1,...matrix.flatMap(r=>r.hours.map(h=>h.count))); return <div className="heatmap"><div></div><b>0-6</b><b>6-12</b><b>12-18</b><b>18-24</b>{matrix.map(r=><React.Fragment key={r.label}><b>{r.label}</b>{r.hours.map(h=><span key={h.key} title={`${h.count} Events`} style={{opacity:.18+.82*(h.count/max)}}>{h.count||''}</span>)}</React.Fragment>)}</div>}
function Nav({tab,setTab,id,icon,label}){return <button onClick={()=>setTab(id)} className={tab===id?'on':''}>{React.cloneElement(icon,{size:22})}<span>{label}</span></button>}
function Timeline({events,byId}){let last=''; return <div className="timeline">{events.map(e=>{const d=day(e.timestamp), t=byId[e.typeId]; const show=d!==last; last=d; return <React.Fragment key={e.id}>{show&&<p className="day"><CalendarDays size={14}/>{d}</p>}<div className="tlitem"><i style={{background:t?.color}}/><b>{t?.label}</b><small>{time(e.timestamp)}</small></div></React.Fragment>})}</div>}

