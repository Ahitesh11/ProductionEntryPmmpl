"use client"

import { BarChart3, Clock, Zap, Activity } from "lucide-react"

interface SidebarProps {
  activeTab: "production" | "granding" | "history"
  setActiveTab: (tab: "production" | "granding" | "history") => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    {
      id: "production" as const,
      label: "Actual Production",
      icon: BarChart3,
      accent: "#3b82f6",
      glow: "rgba(59,130,246,0.35)",
    },
    {
      id: "granding" as const,
      label: "Actual Granding",
      icon: Zap,
      accent: "#f59e0b",
      glow: "rgba(245,158,11,0.35)",
    },
    {
      id: "history" as const,
      label: "History",
      icon: Clock,
      accent: "#10b981",
      glow: "rgba(16,185,129,0.35)",
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .sidebar-root {
          width: 260px;
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          font-family: 'Syne', sans-serif;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        /* Grid texture overlay */
        .sidebar-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        /* Top gradient accent */
        .sidebar-root::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #f59e0b, #10b981);
          z-index: 10;
        }

        .sidebar-header {
          padding: 32px 24px 28px;
          position: relative;
          z-index: 1;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .sidebar-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .sidebar-logo-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(99,102,241,0.5);
        }

        .sidebar-title {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.3px;
          line-height: 1;
        }

        .sidebar-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 10px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          z-index: 1;
        }

        .nav-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          padding: 0 12px;
          margin-bottom: 8px;
        }

        .nav-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          text-align: left;
          overflow: hidden;
        }

        .nav-btn:hover:not(.active) {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.06);
        }

        .nav-btn.active {
          border-color: var(--accent-color);
          background: rgba(255,255,255,0.05);
        }

        .nav-btn.active::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at left center, var(--accent-glow) 0%, transparent 70%);
          pointer-events: none;
        }

        .nav-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .nav-btn.active .nav-icon-wrap {
          background: var(--accent-color);
          box-shadow: 0 0 12px var(--accent-glow);
        }

        .nav-icon {
          color: rgba(255,255,255,0.4);
          transition: color 0.2s;
        }

        .nav-btn.active .nav-icon {
          color: #fff;
        }

        .nav-btn:hover:not(.active) .nav-icon {
          color: rgba(255,255,255,0.7);
        }

        .nav-text {
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          transition: color 0.2s;
          letter-spacing: 0.1px;
        }

        .nav-btn.active .nav-text {
          color: #ffffff;
        }

        .nav-btn:hover:not(.active) .nav-text {
          color: rgba(255,255,255,0.75);
        }

        .nav-active-dot {
          margin-left: auto;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-color);
          box-shadow: 0 0 8px var(--accent-glow);
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 1;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px rgba(16,185,129,0.7);
          animation: pulse-dot 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .status-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.5px;
        }

        .version-badge {
          margin-left: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 1px;
        }
      `}</style>

      <aside className="sidebar-root">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo-row">
            <div className="sidebar-logo-icon">
              <Activity size={18} color="#fff" />
            </div>
            <span className="sidebar-title">PMMPL</span>
          </div>
          <div className="sidebar-subtitle">Production Tally Entry</div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-label">Modules</div>

          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-btn${isActive ? " active" : ""}`}
                style={{
                  "--accent-color": item.accent,
                  "--accent-glow": item.glow,
                } as React.CSSProperties}
              >
                <div className="nav-icon-wrap">
                  <Icon size={16} className="nav-icon" />
                </div>
                <span className="nav-text">{item.label}</span>
                {isActive && <span className="nav-active-dot" />}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="status-row">
            <div className="status-dot" />
            <span className="status-text">System Active</span>
            <span className="version-badge">v0.2</span>
          </div>
        </div>
      </aside>
    </>
  )
}