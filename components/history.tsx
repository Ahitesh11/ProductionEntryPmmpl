"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"

interface HistoryRecord {
  timestamp: string
  rowIndex: number
  partyName: string
  jobCardNo: string
  actual1: string
  sheetName?: string
}

export default function History() {
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/sheets/get-history")
      const result = await response.json()
      if (result.success) {
        setHistoryData(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching history:", error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="page-loading">
          <div className="spinner-ring" />
          <p className="loading-text">Loading history...</p>
        </div>
      </>
    )
  }

  const groupedBySheet = historyData.reduce(
    (acc, record) => {
      const sheet = record.sheetName || "Actual Production"
      if (!acc[sheet]) acc[sheet] = []
      acc[sheet].push(record)
      return acc
    },
    {} as Record<string, HistoryRecord[]>
  )

  const sheetColors: Record<string, { tag: string; dot: string; accent: string }> = {
    "Actual Production": { tag: "blue-tag", dot: "blue-dot", accent: "#3b82f6" },
    "Actual Granding": { tag: "amber-tag", dot: "amber-dot", accent: "#f59e0b" },
  }

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts)
      if (isNaN(d.getTime())) return { date: ts, time: "" }
      const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      return { date, time }
    } catch {
      return { date: ts, time: "" }
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-tag green-tag">HISTORY</div>
            <h2 className="page-title">Update History</h2>
            <p className="page-subtitle">
              {historyData.length} total records across all sheets
            </p>
          </div>
          <button onClick={fetchHistory} className="action-btn green-btn">
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Empty */}
        {historyData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
            </div>
            <p className="empty-title">No history records yet</p>
            <p className="empty-sub">Completed tally entries will appear here.</p>
          </div>
        ) : (
          <div className="sheets-container">
            {Object.entries(groupedBySheet).map(([sheetName, records]) => {
              const colors = sheetColors[sheetName] || { tag: "green-tag", dot: "green-dot", accent: "#10b981" }
              return (
                <div key={sheetName} className="sheet-section">
                  {/* Sheet Header */}
                  <div className="sheet-header">
                    <div className={`page-tag ${colors.tag}`}>{sheetName.toUpperCase()}</div>
                    <div className="sheet-count">{records.length} records</div>
                  </div>

                  {/* Records Grid */}
                  <div className="records-grid">
                    {records.map((record, idx) => {
                      const { date, time } = formatTimestamp(record.timestamp)
                      return (
                        <div
                          key={idx}
                          className="record-card"
                          style={{ "--accent": colors.accent } as React.CSSProperties}
                        >
                          <div className="record-card-left">
                            <div className="record-number">#{String(idx + 1).padStart(2, "0")}</div>
                            <div className="record-party">{record.partyName || "—"}</div>
                            <div className="record-meta-row">
                              <span className="record-meta-label">Job Card</span>
                              <span className="record-meta-val">{record.jobCardNo || "—"}</span>
                            </div>
                            <div className="record-meta-row">
                              <span className="record-meta-label">Actual</span>
                              <span className="record-actual">{record.actual1 || "—"}</span>
                            </div>
                          </div>
                          <div className="record-card-right">
                            <div className="record-date">{date}</div>
                            {time && <div className="record-time">{time}</div>}
                          </div>
                          <div className="record-accent-bar" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  .page-root { padding: 28px; background: #0d0d14; min-height: 100%; font-family: 'Syne', sans-serif; color: #e2e8f0; }

  .page-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 14px; }
  .spinner-ring { width: 44px; height: 44px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.08); border-top-color: #10b981; animation: spin 0.9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono', monospace; }

  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
  .page-header-left { display: flex; flex-direction: column; gap: 4px; }
  .page-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 2.5px; padding: 3px 8px; border-radius: 4px; display: inline-block; width: fit-content; }
  .green-tag { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
  .blue-tag { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }
  .amber-tag { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
  .page-title { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1; margin-top: 2px; }
  .page-subtitle { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 4px; }

  .action-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.18s ease; }
  .green-btn { background: #10b981; color: #fff; border-color: #10b981; }
  .green-btn:hover { background: #059669; box-shadow: 0 0 16px rgba(16,185,129,0.4); }

  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; text-align: center; }
  .empty-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: rgba(255,255,255,0.2); }
  .empty-icon svg { width: 26px; height: 26px; }
  .empty-title { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
  .empty-sub { font-size: 12px; color: rgba(255,255,255,0.25); }

  .sheets-container { display: flex; flex-direction: column; gap: 32px; }

  .sheet-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .sheet-count { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.3); margin-left: auto; }

  .records-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px; }

  .record-card {
    position: relative;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .record-card:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--accent, rgba(255,255,255,0.15));
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .record-accent-bar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--accent, rgba(255,255,255,0.2));
    border-radius: 10px 0 0 10px;
  }

  .record-card-left { flex: 1; min-width: 0; padding-left: 6px; }
  .record-number { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.2); letter-spacing: 1px; margin-bottom: 4px; }
  .record-party { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .record-meta-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .record-meta-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 0.5px; min-width: 52px; }
  .record-meta-val { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.6); }
  .record-actual { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent, #10b981); font-weight: 500; }

  .record-card-right { text-align: right; flex-shrink: 0; }
  .record-date { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5); white-space: nowrap; }
  .record-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 3px; }
`