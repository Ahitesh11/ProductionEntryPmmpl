"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ProductionRecord {
  [key: string]: any
}

// ✅ Fixed timestamp format: MM/DD/YY HH:MM:SS
const getTimestamp = () => {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const yy = String(now.getFullYear()).slice(-2)
  const hh = String(now.getHours()).padStart(2, "0")
  const min = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  return `${mm}/${dd}/${yy} ${hh}:${min}:${ss}`
}

export default function ActualProduction() {
  const [data, setData] = useState<ProductionRecord[]>([])
  const [filteredData, setFilteredData] = useState<ProductionRecord[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [rawMaterialColumns, setRawMaterialColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ProductionRecord | null>(null)
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liveTimestamp, setLiveTimestamp] = useState(getTimestamp())

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (showModal) {
      const interval = setInterval(() => setLiveTimestamp(getTimestamp()), 1000)
      return () => clearInterval(interval)
    }
  }, [showModal])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/sheets/get-data?sheet=Actual Production")
      const result = await response.json()
      if (result.success && result.data.length > 0) {
        const allData = result.data
        const pendingRecords = allData.filter((record: ProductionRecord) => {
          const actual1Value = record.Actual1 || record.actual1 || record["Actual1"]
          const isNotCompleted = !actual1Value || String(actual1Value).trim() === ""

          // Filter out blank rows — must have at least Party Name or Job Card No
          const partyName = record["Party Name"] || record["PartyName"] || record["party name"] || ""
          const jobCardNo = record["Job Card No"] || record["JobCardNo"] || record["job card no"] || record["Job Card Number"] || ""
          const hasData = String(partyName).trim() !== "" || String(jobCardNo).trim() !== ""

          return isNotCompleted && hasData
        })
        setData(allData)
        setFilteredData(pendingRecords)

        if (pendingRecords.length > 0) {
          const allColumns = Object.keys(pendingRecords[0])
          const filteredColumns = allColumns.filter(
            (col) => col !== "rowIndex" && col.toLowerCase() !== "rawmaterials"
          )

          const rawMaterialCols: string[] = []
          const otherColumns: string[] = []

          filteredColumns.forEach((col) => {
            const lowerCol = col.toLowerCase()
            if (
              (lowerCol.includes("name") && lowerCol.includes("raw") && lowerCol.includes("material")) ||
              (lowerCol.includes("quantity") && lowerCol.includes("raw") && lowerCol.includes("material"))
            ) {
              rawMaterialCols.push(col)
            } else {
              otherColumns.push(col)
            }
          })

          rawMaterialCols.sort((a, b) => {
            const getNumber = (str: string): number => {
              const match = str.match(/\d+/)
              return match ? parseInt(match[0]) : 0
            }
            const numA = getNumber(a)
            const numB = getNumber(b)
            if (numA !== numB) return numA - numB
            if (a.toLowerCase().includes("name")) return -1
            if (b.toLowerCase().includes("name")) return 1
            return 0
          })

          setRawMaterialColumns(rawMaterialCols)

          const combinedColumns = [
            ...otherColumns.filter((col) => {
              const lowerCol = col.toLowerCase()
              return (
                lowerCol !== "actual1" &&
                pendingRecords.some(
                  (record: ProductionRecord) =>
                    record[col] !== undefined && record[col] !== null && String(record[col]).trim() !== ""
                )
              )
            }),
            ...rawMaterialCols.filter((col) =>
              pendingRecords.some(
                (record: ProductionRecord) =>
                  record[col] !== undefined && record[col] !== null && String(record[col]).trim() !== ""
              )
            ),
          ]
          setColumns(combinedColumns)
        } else {
          setColumns([])
          setRawMaterialColumns([])
        }
      } else {
        setData([])
        setFilteredData([])
        setColumns([])
        setRawMaterialColumns([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
    setLoading(false)
  }

  const openTallyModal = (rowIndex: number, record: ProductionRecord) => {
    setSelectedRecord(record)
    setSelectedRowIndex(rowIndex)
    setLiveTimestamp(getTimestamp())
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRecord(null)
    setSelectedRowIndex(null)
  }

  const handleTallyEntry = async () => {
    if (!selectedRecord || selectedRowIndex === null) return
    setIsSubmitting(true)
    try {
      const timestamp = getTimestamp()
      const response = await fetch("/api/sheets/save-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: selectedRowIndex,
          sheetName: "Actual Production",
          timestamp,
          data: { ...selectedRecord, Actual1: timestamp },
        }),
      })
      if (response.ok) {
        closeModal()
        await fetchData()
      } else {
        console.error("Failed to save tally entry")
      }
    } catch (error) {
      console.error("Error saving tally entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isRawMaterialColumn = (columnName: string): boolean => rawMaterialColumns.includes(columnName)

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="page-loading">
          <div className="spinner-ring blue" />
          <p className="loading-text">Loading production data...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <div className="page-tag blue-tag">PRODUCTION</div>
            <h2 className="page-title">Actual Production</h2>
            <p className="page-subtitle">
              {filteredData.length} pending • {data.length - filteredData.length} completed
            </p>
          </div>
          <div className="page-header-actions">
            <button onClick={fetchData} className="action-btn blue-btn">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="info-banner blue-banner">
          <span className="info-dot blue-dot" />
          <span>
            Showing pending records only.
            {filteredData.length < data.length && (
              <strong> {data.length - filteredData.length} entries already completed.</strong>
            )}
          </span>
        </div>

        {/* Table / Empty */}
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon blue-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="empty-title">All tally entries are completed!</p>
            <p className="empty-sub">No pending production records found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col} className={`th blue-th${isRawMaterialColumn(col) ? " raw-mat-th" : ""}`}>
                      {col}
                    </th>
                  ))}
                  <th className="th blue-th action-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData
                  .filter((record) =>
                    // Only show rows where at least one visible column has data
                    columns.some(
                      (col) => record[col] !== undefined && record[col] !== null && String(record[col]).trim() !== ""
                    )
                  )
                  .map((record, rowIdx) => (
                  <tr key={rowIdx} className="tr">
                    {columns.map((col) => (
                      <td
                        key={`${rowIdx}-${col}`}
                        className={`td${isRawMaterialColumn(col) ? " raw-mat-td" : ""}`}
                      >
                        {String(record[col] || "")}
                      </td>
                    ))}
                    <td className="td action-td">
                      <button onClick={() => openTallyModal(record.rowIndex, record)} className="tally-btn">
                        Tally Done
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedRecord && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <div className="modal-header-left">
                  <div className="page-tag blue-tag">CONFIRM</div>
                  <h3 className="modal-title">Mark as Completed?</h3>
                </div>
                <button onClick={closeModal} className="modal-close" disabled={isSubmitting}>✕</button>
              </div>

              <div className="modal-body">
                <div className="record-preview">
                  <div className="record-preview-label">Record Details</div>
                  <div className="record-list">
                    {columns.filter((col) => !isRawMaterialColumn(col)).slice(0, 10).map((col) =>
                      selectedRecord[col] ? (
                        <div key={col} className="record-row">
                          <span className="record-key">{col}</span>
                          <span className="record-val">{String(selectedRecord[col])}</span>
                        </div>
                      ) : null
                    )}
                    {rawMaterialColumns.length > 0 && (
                      <div className="raw-mat-section">
                        <div className="raw-mat-label">Raw Materials</div>
                        {rawMaterialColumns.slice(0, 6).map((col) =>
                          selectedRecord[col] ? (
                            <div key={col} className="record-row">
                              <span className="record-key">{col}</span>
                              <span className="record-val">{String(selectedRecord[col])}</span>
                            </div>
                          ) : null
                        )}
                        {rawMaterialColumns.length > 6 && (
                          <p className="raw-mat-more">+{rawMaterialColumns.length - 6} more raw material entries</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="timestamp-card blue-timestamp">
                  <div className="timestamp-label">Timestamp to be saved</div>
                  <div className="timestamp-value">{liveTimestamp}</div>
                  <div className="timestamp-format">Format: MM/DD/YY HH:MM:SS</div>
                </div>

                <div className="warning-card">
                  <span className="warning-icon">⚠</span>
                  <span>Once confirmed, this record will be marked as completed and removed from the pending list.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={closeModal} className="action-btn ghost-btn" disabled={isSubmitting}>
                  Cancel
                </button>
                <button onClick={handleTallyEntry} className="action-btn blue-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><RefreshCw size={13} className="spin-icon" /> Processing...</>
                  ) : (
                    "✓ Confirm & Save"
                  )}
                </button>
              </div>
            </div>
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
  .spinner-ring { width: 44px; height: 44px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.08); }
  .spinner-ring.blue { border-top-color: #3b82f6; animation: spin 0.9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: rgba(255,255,255,0.4); font-family: 'JetBrains Mono', monospace; }

  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .page-header-left { display: flex; flex-direction: column; gap: 4px; }
  .page-header-actions { display: flex; gap: 8px; align-items: center; }
  .page-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 500; letter-spacing: 2.5px; padding: 3px 8px; border-radius: 4px; display: inline-block; width: fit-content; }
  .blue-tag { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }
  .page-title { font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; line-height: 1; margin-top: 2px; }
  .page-subtitle { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 4px; }

  .action-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.18s ease; }
  .blue-btn { background: #3b82f6; color: #fff; border-color: #3b82f6; }
  .blue-btn:hover { background: #60a5fa; box-shadow: 0 0 16px rgba(59,130,246,0.4); }
  .ghost-btn { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.1); }
  .ghost-btn:hover { background: rgba(255,255,255,0.09); color: #fff; }

  .info-banner { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 8px; font-size: 11px; margin-bottom: 16px; border: 1px solid; }
  .blue-banner { background: rgba(59,130,246,0.07); border-color: rgba(59,130,246,0.2); color: rgba(255,255,255,0.5); }
  .info-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .blue-dot { background: #3b82f6; box-shadow: 0 0 6px rgba(59,130,246,0.7); }

  .table-wrap { overflow-x: auto; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); }
  .data-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .th { padding: 10px 12px; text-align: left; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; white-space: nowrap; }
  .blue-th { background: #3b82f6; color: #fff; border-bottom: 2px solid #2563eb; }
  .raw-mat-th { background: #1d4ed8 !important; }
  .action-th { text-align: center; }
  .tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.15s; }
  .tr:hover { background: rgba(59,130,246,0.05); }
  .tr:last-child { border-bottom: none; }
  .td { padding: 9px 12px; color: rgba(255,255,255,0.7); white-space: nowrap; }
  .raw-mat-td { background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.5); }
  .action-td { text-align: center; }

  .tally-btn { background: #10b981; color: #fff; border: none; padding: 5px 12px; border-radius: 6px; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .tally-btn:hover { background: #059669; box-shadow: 0 0 10px rgba(16,185,129,0.4); }

  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 24px; text-align: center; }
  .empty-icon { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .empty-icon svg { width: 28px; height: 28px; }
  .blue-icon { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); }
  .empty-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .empty-sub { font-size: 12px; color: rgba(255,255,255,0.35); }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; backdrop-filter: blur(4px); }
  .modal-box { background: #13131f; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; width: 100%; max-width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }
  .modal-header { padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: flex-start; }
  .modal-header-left { display: flex; flex-direction: column; gap: 5px; }
  .modal-title { font-size: 17px; font-weight: 800; color: #fff; }
  .modal-close { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); width: 30px; height: 30px; border-radius: 7px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
  .modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

  .modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }

  .record-preview { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 9px; overflow: hidden; }
  .record-preview-label { padding: 8px 12px; background: rgba(255,255,255,0.03); font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); letter-spacing: 1.5px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .record-list { max-height: 150px; overflow-y: auto; }
  .record-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 11px; gap: 12px; }
  .record-row:last-child { border-bottom: none; }
  .record-key { color: rgba(255,255,255,0.4); flex-shrink: 0; }
  .record-val { color: rgba(255,255,255,0.8); text-align: right; font-weight: 600; }

  .raw-mat-section { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 4px; }
  .raw-mat-label { padding: 6px 12px; font-size: 9px; font-weight: 700; color: rgba(59,130,246,0.7); letter-spacing: 1.5px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }
  .raw-mat-more { padding: 6px 12px; font-size: 10px; color: rgba(255,255,255,0.3); font-style: italic; }

  .timestamp-card { padding: 12px 14px; border-radius: 9px; border: 1px solid; }
  .blue-timestamp { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.25); }
  .timestamp-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; font-family: 'JetBrains Mono', monospace; margin-bottom: 6px; }
  .timestamp-value { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 500; color: #3b82f6; letter-spacing: 1px; }
  .timestamp-format { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: rgba(59,130,246,0.5); margin-top: 4px; letter-spacing: 0.5px; }

  .warning-card { display: flex; align-items: flex-start; gap: 8px; padding: 10px 13px; background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.2); border-radius: 8px; font-size: 11px; color: rgba(251,191,36,0.8); }
  .warning-icon { flex-shrink: 0; font-size: 13px; }

  .modal-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; justify-content: flex-end; gap: 8px; }

  .spin-icon { animation: spin 0.9s linear infinite; }
`