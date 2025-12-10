// src/pages/MobileDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Radial from "../widgets/Radial";
import PressureMap from "../widgets/PressureMap";
import "../styles/mobile.css";

export default function MobileDashboard() {
  const [telemetry, setTelemetry] = useState([]);
  const [leftBattery, setLeftBattery] = useState(85);
  const [rightBattery, setRightBattery] = useState(92);
  const [gaitScore, setGaitScore] = useState(82);
  const [postureScore, setPostureScore] = useState(74);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // try connect to backend (optional)
    try {
      const s = io("http://localhost:4000", { transports: ["websocket", "polling"] });
      socketRef.current = s;
      s.on("connect", () => setConnected(true));
      s.on("disconnect", () => setConnected(false));
      s.on("device:data", (p) => {
        setTelemetry(prev => [...prev.slice(-199), p]);
        if (p.leftBattery != null) setLeftBattery(p.leftBattery);
        if (p.rightBattery != null) setRightBattery(p.rightBattery);
        if (p.gaitScore != null) setGaitScore(p.gaitScore);
        if (p.postureScore != null) setPostureScore(p.postureScore);
      });
    } catch(e){ console.warn("Socket failed:", e?.message); }

    const id = setInterval(() => {
      // simulated demo updates
      setLeftBattery(b => Math.max(10, Math.min(100, Math.round(b + (Math.random()-0.48)*2))));
      setRightBattery(b => Math.max(10, Math.min(100, Math.round(b + (Math.random()-0.48)*2))));
      setGaitScore(s => Math.max(20, Math.min(99, Math.round(s + (Math.random()-0.5)*2))));
      setPostureScore(s => Math.max(20, Math.min(99, Math.round(s + (Math.random()-0.5)*2))));
      const now = Date.now();
      setTelemetry(prev => [...prev.slice(-199), { t: now, left: Math.random()*100, right: Math.random()*100 }]);
    }, 2000);

    return () => { clearInterval(id); if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  return (
    <div className="mobile-shell">
      <div className="mobile-topbar">
        <div className="top-left">
          <div className="small-muted">WELCOME BACK,</div>
          <div className="user-name">Karthik G Raj</div>
        </div>
        <div className="top-right">
          <img src="/avatar.png" alt="avatar" className="avatar" />
        </div>
      </div>

      <div className="mobile-content">
        <div className="row two-cards">
          <div className="insole-card">
            <div className="insole-title">LEFT</div>
            <div className="insole-icon">👣</div>
            <div className="battery-bar">
              <div className="bar-fill" style={{width: `${leftBattery}%`}} />
            </div>
            <div className="battery-text">{Math.round(leftBattery)}% Battery</div>
          </div>

          <div className="insole-card">
            <div className="insole-title">RIGHT</div>
            <div className="insole-icon">👣</div>
            <div className="battery-bar">
              <div className="bar-fill" style={{width: `${rightBattery}%`}} />
            </div>
            <div className="battery-text">{Math.round(rightBattery)}% Battery</div>
          </div>
        </div>

        <div className="card analysis-card">
          <div className="analysis-header">
            <div>
              <div className="analysis-title">Today's Analysis</div>
              <div className="muted">Last update: a few seconds ago</div>
            </div>
            <div className="status-pill">Good Condition</div>
          </div>

          <div className="analysis-body">
            <div className="radial-wrap"><Radial value={gaitScore} label="Gait Score" color="#2DA2FF" /></div>
            <div className="divider-vertical" />
            <div className="radial-wrap"><Radial value={postureScore} label="Posture Score" color="#8A57FF" /></div>
          </div>
        </div>

        <div className="section-title">
          <div>Pressure Map</div>
          <div className="live-dot">Today</div>
        </div>

        <div className="card pressure-card">
          <PressureMap telemetry={telemetry.slice(-60)} />
        </div>
      </div>

      <div className="bottom-nav">
        <div className="nav-left">
          <div className="nav-item active">Home</div>
          <div className="nav-item">Trends</div>
        </div>

        <button className="fab" aria-label="add">+</button>

        <div className="nav-right">
          <div className="nav-item">Reports</div>
          <div className="nav-item">Settings</div>
        </div>
      </div>
    </div>
  );
}
