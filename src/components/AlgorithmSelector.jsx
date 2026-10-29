function AlgorithmSelector({
  selectedAlgorithm,
  setSelectedAlgorithm,
  onRunSimulation,
  gridValidation,
  simulationResult
}) {
  const algorithms = [
    {
      id: 'BFS',
      name: 'Breadth-First Search (BFS)',
      category: 'Uninformed / Classical',
      dataStructure: 'Queue (FIFO)',
      optimality: 'Guaranteed Shortest Path (uniform costs)',
      heuristic: 'None (Uniform exploration)',
      description: 'Expands node frontier level by level. Guaranteed to find the nearest emergency exit with minimum moves.',
      status: 'active',
      badge: 'Active'
    },
    {
      id: 'DFS',
      name: 'Depth-First Search (DFS)',
      category: 'Uninformed / Classical',
      dataStructure: 'Stack (LIFO)',
      optimality: 'Suboptimal (Path may be deep and circuitous)',
      heuristic: 'None (Deep exploration)',
      description: 'Traverses each branch to maximum depth before backtracking. Explores deep alternative routes.',
      status: 'active',
      badge: 'Active'
    },
    {
      id: 'ASTAR',
      name: 'A* Search',
      category: 'Informed / Heuristic',
      dataStructure: 'Priority Queue (Min-Heap)',
      optimality: 'Optimal & Complete (with admissible heuristic)',
      heuristic: 'f(n) = g(n) + h(n) [Manhattan distance]',
      description: 'Combines actual move cost from start g(n) with Manhattan distance to nearest exit h(n). Guaranteed optimal shortest route.',
      status: 'active',
      badge: 'Active'
    },
    {
      id: 'GREEDY',
      name: 'Greedy Best-First Search',
      category: 'Informed / Heuristic',
      dataStructure: 'Priority Queue (Min-Heap)',
      optimality: 'Suboptimal (Can be diverted by dead-ends/walls)',
      heuristic: 'f(n) = h(n) [Distance to closest exit]',
      description: 'Prioritizes nodes physically nearest to an exit. Rapid search towards exits, though not guaranteed to be shortest.',
      status: 'active',
      badge: 'Active'
    }
  ]

  const currentAlgo = algorithms.find((a) => a.id === selectedAlgorithm) || algorithms[0]
  const isGridReady = gridValidation ? gridValidation.algorithmReady : true
  const canRun = isGridReady

  const handleRunClick = () => {
    if (canRun && onRunSimulation) {
      onRunSimulation(selectedAlgorithm)
    }
  }

  return (
    <div className="algorithm-selector-panel">
      <div className="panel-header">
        <h2 className="panel-title">Evacuation Search Algorithm</h2>
        <span className="algo-counter">4 Algorithms Active (Stage 6)</span>
      </div>

      <div className="algo-pills" role="radiogroup" aria-label="Select AI search algorithm">
        {algorithms.map((algo) => (
          <button
            key={algo.id}
            type="button"
            role="radio"
            aria-checked={selectedAlgorithm === algo.id}
            className={`algo-pill-btn ${selectedAlgorithm === algo.id ? 'active' : ''}`}
            onClick={() => setSelectedAlgorithm(algo.id)}
          >
            <div className="algo-pill-top">
              <span className="pill-code">{algo.id}</span>
              <span className="algo-active-tag">Active</span>
            </div>
            <span className="pill-name">{algo.name.split(' (')[0]}</span>
          </button>
        ))}
      </div>

      <div className="algo-info-card">
        <div className="info-card-header">
          <span className="info-title">{currentAlgo.name}</span>
          <span className="info-badge badge-active">{currentAlgo.badge}</span>
        </div>
        <p className="info-desc">{currentAlgo.description}</p>
        
        <div className="info-specs-grid">
          <div className="spec-item">
            <span className="spec-label">Internal Frontier:</span>
            <span className="spec-val">{currentAlgo.dataStructure}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Optimality Guarantee:</span>
            <span className="spec-val">{currentAlgo.optimality}</span>
          </div>
          <div className="spec-item spec-full">
            <span className="spec-label">Evaluation Function:</span>
            <span className="spec-val mono-val">{currentAlgo.heuristic}</span>
          </div>
        </div>
      </div>

      <div className="simulation-action-wrapper">
        <button
          type="button"
          disabled={!canRun}
          className={`run-simulation-btn ${canRun ? 'active-run' : 'disabled'}`}
          onClick={handleRunClick}
          title={
            !isGridReady
              ? 'Floor plan is not algorithm-ready'
              : `Run ${currentAlgo.name} on current floor plan`
          }
        >
          <span className="btn-icon" aria-hidden="true">▶</span>
          <span>Run Evacuation Simulation</span>
        </button>

        <p className="btn-helper-text">
          {!isGridReady ? (
            <>
              <span className="helper-warn-icon" aria-hidden="true">⚠️</span>
              <span>
                Grid invalid: {gridValidation?.errors?.[0] || 'Must have 1 Start and at least 1 Exit.'}
              </span>
            </>
          ) : simulationResult && simulationResult.algorithm === selectedAlgorithm ? (
            <>
              <span className="helper-check-icon" aria-hidden="true">✓</span>
              <span>
                {currentAlgo.name.split(' (')[0]} completed. Click above to re-run or use playback controls on the preview.
              </span>
            </>
          ) : (
            <>
              <span className="helper-ready-icon" aria-hidden="true">✓</span>
              <span>
                Ready to execute <strong>{currentAlgo.name.split(' (')[0]}</strong> on the active building layout.
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default AlgorithmSelector
