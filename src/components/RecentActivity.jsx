function RecentActivity({ recentRuns = [] }) {
  const hasRuns = recentRuns && recentRuns.length > 0

  return (
    <div className="recent-activity-panel">
      <div className="panel-header">
        <h2 className="panel-title">Session Activity Log</h2>
        <span className="log-counter">{recentRuns.length} Recorded Run{recentRuns.length === 1 ? '' : 's'}</span>
      </div>

      {!hasRuns ? (
        <div className="activity-empty-state">
          <div className="empty-state-graphic" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
            </svg>
          </div>
          <div className="empty-state-content">
            <span className="empty-state-headline">No simulation runs recorded</span>
            <p className="empty-state-subtext">
              Historical benchmark comparisons, path trajectories, and step recordings will be logged here automatically once simulations are executed.
            </p>
          </div>
        </div>
      ) : (
        <div className="activity-runs-list" role="list">
          {recentRuns.map((run) => (
            <div key={run.id} className="activity-run-item" role="listitem">
              <div className="run-item-left">
                <span className={`run-algo-pill ${run.success ? 'pill-success' : 'pill-failed'}`}>
                  {run.algorithm}
                </span>
                <div className="run-details">
                  <div className="run-title-line">
                    <span className="run-building-name">{run.buildingName}</span>
                    <span className="run-timestamp">{run.timestamp}</span>
                  </div>
                  <div className="run-metrics-line">
                    {run.success ? (
                      <>
                        <span className="run-metric">
                          Route: <strong>{run.pathLength} moves</strong>
                        </span>
                        <span className="metric-sep">•</span>
                        <span className="run-metric">
                          Explored: <strong>{run.exploredCount} nodes</strong>
                        </span>
                        <span className="metric-sep">•</span>
                        <span className="run-metric">
                          Time: <strong>{run.executionTimeMs} ms</strong>
                        </span>
                        {run.exitCoord && (
                          <>
                            <span className="metric-sep">•</span>
                            <span className="run-metric">
                              Exit: <strong>[R{run.exitCoord.row + 1}, C{run.exitCoord.col + 1}]</strong>
                            </span>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="run-metric run-metric-danger">
                          No reachable exit found
                        </span>
                        <span className="metric-sep">•</span>
                        <span className="run-metric">
                          Explored: <strong>{run.exploredCount} nodes</strong>
                        </span>
                        <span className="metric-sep">•</span>
                        <span className="run-metric">
                          Time: <strong>{run.executionTimeMs} ms</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="run-item-right">
                <span className={`run-status-badge ${run.success ? 'status-badge-success' : 'status-badge-danger'}`}>
                  {run.success ? 'Optimal Route' : 'No Safe Route'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentActivity
