function ResultsPanel({ simulationResult = null, selectedAlgorithm = 'BFS' }) {
  const hasResult = Boolean(simulationResult)
  const isSuccess = simulationResult?.success

  const metrics = [
    {
      label: 'Route Length',
      value: hasResult ? (isSuccess ? String(simulationResult.pathLength) : '0') : '—',
      unit: hasResult ? 'moves' : 'steps',
      desc: hasResult
        ? isSuccess
          ? `${simulationResult.path.length} cells in safe route`
          : 'No egress pathway reachable'
        : 'Optimal path move count',
      highlight: isSuccess ? 'metric-success' : ''
    },
    {
      label: 'Nodes Explored',
      value: hasResult ? String(simulationResult.exploredCount) : '—',
      unit: 'nodes',
      desc: hasResult ? 'Frontier states dequeued' : 'Total graph states visited',
      highlight: hasResult ? 'metric-explored' : ''
    },
    {
      label: 'Execution Time',
      value: hasResult ? String(simulationResult.executionTimeMs) : '—',
      unit: 'ms',
      desc: hasResult ? 'performance.now() duration' : 'Algorithm compute duration',
      highlight: hasResult ? 'metric-info' : ''
    },
    {
      label: 'Route Status',
      value: hasResult ? (isSuccess ? 'Success' : 'No Safe Route') : 'Pending',
      unit: hasResult ? simulationResult.algorithm : selectedAlgorithm,
      desc: hasResult ? (isSuccess ? 'Egress route verified' : 'Egress blocked') : 'Current evacuation state',
      highlight: hasResult ? (isSuccess ? 'metric-success' : 'metric-danger') : ''
    }
  ]

  return (
    <div className="results-panel">
      <div className="panel-header">
        <h2 className="panel-title">Simulation Analytics & Output</h2>
        <span
          className={`results-status-tag ${
            !hasResult
              ? 'status-awaiting'
              : isSuccess
                ? 'status-success'
                : 'status-danger'
          }`}
        >
          {!hasResult
            ? 'Awaiting Execution'
            : isSuccess
              ? 'Safe Route Found'
              : 'No Safe Route'}
        </span>
      </div>

      {!hasResult ? (
        <div className="results-empty-state">
          <div className="empty-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3 className="empty-title">No simulation run yet</h3>
          <p className="empty-desc">
            Select an algorithm (BFS, DFS, A*, Greedy) and click <strong>Run Evacuation Simulation</strong> above to compute routes, measure moves, and animate search frontier exploration.
          </p>
        </div>
      ) : (
        <div className={`results-summary-card ${isSuccess ? 'summary-card-success' : 'summary-card-failed'}`}>
          <div className="summary-card-top">
            <span className="summary-algo-badge">Algorithm: {simulationResult.algorithm || selectedAlgorithm}</span>
            {isSuccess && simulationResult.selectedExit && (
              <span className="summary-exit-badge">
                Selected Exit: [R{simulationResult.selectedExit.row + 1}, C{simulationResult.selectedExit.col + 1}]
              </span>
            )}
          </div>
          <p className="summary-message-text">{simulationResult.message}</p>
        </div>
      )}

      <div className="metrics-grid">
        {metrics.map((m, idx) => (
          <div key={idx} className={`metric-box ${m.highlight}`}>
            <span className="metric-label">{m.label}</span>
            <div className="metric-val-wrapper">
              <span className="metric-value">{m.value}</span>
              <span className="metric-unit">{m.unit}</span>
            </div>
            <span className="metric-desc">{m.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultsPanel
