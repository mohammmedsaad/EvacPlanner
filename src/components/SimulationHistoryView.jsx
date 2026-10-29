import { useState, useMemo } from 'react'

function SimulationHistoryView({
  recentRuns = [],
  setActivePage,
  onRunSimulation,
  onSelectAlgorithm,
  onClearHistory,
  onRestoreSnapshot
}) {
  const [filterAlgo, setFilterAlgo] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Filtered runs based on user selection
  const filteredRuns = useMemo(() => {
    return recentRuns.filter((run) => {
      const matchAlgo = filterAlgo === 'ALL' || run.algorithm === filterAlgo
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'SUCCESS' && run.success) ||
        (filterStatus === 'FAILED' && !run.success)
      return matchAlgo && matchStatus
    })
  }, [recentRuns, filterAlgo, filterStatus])

  const totalRuns = recentRuns.length
  const successfulRuns = recentRuns.filter((r) => r.success).length
  const failedRuns = totalRuns - successfulRuns

  const handleClear = () => {
    if (onClearHistory) {
      onClearHistory()
    }
    setShowClearConfirm(false)
  }

  const handleRerun = (run) => {
    if (onSelectAlgorithm) onSelectAlgorithm(run.algorithm)
    if (run.gridSnapshot && onRestoreSnapshot) {
      onRestoreSnapshot(run.gridSnapshot)
    }
    if (onRunSimulation) {
      onRunSimulation(run.algorithm)
    }
    setActivePage('dashboard')
  }

  return (
    <div className="history-view-container">
      {/* 1. Header Information */}
      <div className="history-header-card">
        <div className="history-header-top-row">
          <div>
            <div className="stage-milestone-pill">
              <span className="milestone-dot"></span>
              <span>Session Telemetry & Audit Logs</span>
            </div>
            <h2 className="history-title">Evacuation Simulation History & Logs</h2>
            <p className="history-subtitle">
              Centralized execution audit trail recording every simulation run across the <strong>Operations Dashboard</strong> and
              <strong> Evacuation Simulation Engine</strong>.
            </p>
          </div>

          <div className="history-header-actions">
            <button
              type="button"
              className="return-dashboard-btn"
              onClick={() => setActivePage('dashboard')}
            >
              ← Dashboard
            </button>
            <button
              type="button"
              className="return-dashboard-btn"
              onClick={() => setActivePage('simulation')}
            >
              Simulation Engine →
            </button>
          </div>
        </div>

        {/* Persistence & Event Policy Banner */}
        <div className="history-disclaimer-pill">
          <span className="pill-dot"></span>
          <span>
            <strong>Storage Policy:</strong> Session storage is maintained in browser tab memory and persisted to <code>sessionStorage</code> for the duration of this tab session. No external database or permanent multi-device sync is used.
          </span>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="history-kpi-row">
          <div className="kpi-chip">
            <span className="kpi-num">{totalRuns}</span>
            <span className="kpi-lbl">Total Simulations</span>
          </div>
          <div className="kpi-chip kpi-success">
            <span className="kpi-num">{successfulRuns}</span>
            <span className="kpi-lbl">Optimal Routes</span>
          </div>
          <div className="kpi-chip kpi-danger">
            <span className="kpi-num">{failedRuns}</span>
            <span className="kpi-lbl">Blocked / No Route</span>
          </div>
        </div>
      </div>

      {/* 2. Main History Content */}
      <div className="history-content-card">
        <div className="history-card-header">
          <div className="header-left-group">
            <h3 className="section-title">Session Execution Log</h3>
            <span className="log-counter">
              {filteredRuns.length} of {totalRuns} Entry{totalRuns === 1 ? '' : 'ies'} Displayed
            </span>
          </div>

          {/* Filtering & Clear Actions */}
          <div className="history-controls-toolbar">
            <div className="filter-group">
              <label htmlFor="history-filter-algo" className="filter-label">Algorithm:</label>
              <select
                id="history-filter-algo"
                value={filterAlgo}
                onChange={(e) => setFilterAlgo(e.target.value)}
                className="history-filter-select"
              >
                <option value="ALL">All Algorithms</option>
                <option value="BFS">BFS</option>
                <option value="ASTAR">A* Search</option>
                <option value="DFS">DFS</option>
                <option value="GREEDY">Greedy Best-First</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="history-filter-status" className="filter-label">Status:</label>
              <select
                id="history-filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="history-filter-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Safe Route Found</option>
                <option value="FAILED">No Safe Route</option>
              </select>
            </div>

            {totalRuns > 0 && (
              <div className="clear-history-container">
                {showClearConfirm ? (
                  <div className="clear-confirm-dialog">
                    <span className="confirm-text">Clear all logs?</span>
                    <button
                      type="button"
                      className="confirm-yes-btn"
                      onClick={handleClear}
                    >
                      Yes, Clear
                    </button>
                    <button
                      type="button"
                      className="confirm-no-btn"
                      onClick={() => setShowClearConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="clear-history-btn"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    🗑️ Clear History
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {totalRuns === 0 ? (
          <div className="history-empty-state">
            <div className="empty-state-graphic" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
            </div>
            <div className="empty-state-content">
              <h4>No simulation runs recorded yet</h4>
              <p>
                Simulations executed from the <strong>Operations Dashboard</strong> or <strong>Evacuation Simulation Engine</strong> will automatically log their telemetry here.
              </p>
              <div className="empty-state-actions">
                <button
                  type="button"
                  className="inline-action-btn"
                  onClick={() => setActivePage('dashboard')}
                >
                  Go to Dashboard & Run
                </button>
                <button
                  type="button"
                  className="inline-action-btn btn-secondary"
                  onClick={() => setActivePage('simulation')}
                >
                  Open Simulation Engine
                </button>
              </div>
            </div>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="history-empty-filter">
            <p>No recorded simulations match the selected filter criteria.</p>
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setFilterAlgo('ALL')
                setFilterStatus('ALL')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Source</th>
                  <th>Algorithm</th>
                  <th>Floor Plan Blueprint</th>
                  <th>Egress Status</th>
                  <th>Route Length</th>
                  <th>Explored</th>
                  <th>Compute Time</th>
                  <th>Target Exit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run) => (
                  <tr key={run.id} className={run.success ? 'row-success' : 'row-failure'}>
                    <td className="cell-timestamp">{run.timestamp}</td>
                    <td className="cell-source">
                      <span className="source-tag">{run.source || 'Dashboard'}</span>
                    </td>
                    <td>
                      <span className={`run-algo-pill ${run.success ? 'pill-success' : 'pill-failed'}`}>
                        {run.algorithm}
                      </span>
                    </td>
                    <td className="cell-building">{run.buildingName}</td>
                    <td>
                      <span className={`run-status-badge ${run.success ? 'status-badge-success' : 'status-badge-danger'}`}>
                        {run.success ? 'Route Found' : 'No Safe Route'}
                      </span>
                    </td>
                    <td className="cell-metric">
                      {run.success ? (
                        <span><strong>{run.pathLength}</strong> moves</span>
                      ) : (
                        <span className="metric-unreachable">—</span>
                      )}
                    </td>
                    <td className="cell-metric">
                      <span><strong>{run.exploredCount}</strong> nodes</span>
                    </td>
                    <td className="cell-metric">
                      <span><strong>{run.executionTimeMs}</strong> ms</span>
                    </td>
                    <td className="cell-coord">
                      {run.exitCoord ? (
                        <code>[R{run.exitCoord.row + 1}, C{run.exitCoord.col + 1}]</code>
                      ) : (
                        <span className="text-dim">None</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="history-rerun-btn"
                        title={
                          run.gridSnapshot
                            ? `Restore layout snapshot and re-run ${run.algorithm}`
                            : `Re-run ${run.algorithm} on active floor plan`
                        }
                        onClick={() => handleRerun(run)}
                      >
                        Re-run
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimulationHistoryView