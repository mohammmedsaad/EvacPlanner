import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { CELL_TYPES, CELL_CONFIG, DEFAULT_GRID, PRESETS } from '../constants/gridConstants'
import { cloneGrid, validateGrid } from '../utils/gridUtils'
import { runAlgorithm } from '../algorithms/index'

const ALGORITHM_CONFIGS = [
  {
    id: 'BFS',
    name: 'Breadth-First Search',
    acronym: 'BFS',
    dataStructure: 'Queue (FIFO)',
    guarantee: 'Guaranteed Shortest',
    evalFn: 'None (Uniform Layered Expansion)',
    description: 'Expands node frontier level by level. Guaranteed to find the nearest emergency exit with the minimum moves on uniform grids.'
  },
  {
    id: 'ASTAR',
    name: 'A* Search',
    acronym: 'A*',
    dataStructure: 'Priority Queue (Min-Heap by f)',
    guarantee: 'Guaranteed Shortest',
    evalFn: 'f(n) = g(n) + h(n) [Manhattan Distance]',
    description: 'Combines exact move cost from start g(n) with admissible Manhattan heuristic h(n) to focus directly towards emergency exits.'
  },
  {
    id: 'DFS',
    name: 'Depth-First Search',
    acronym: 'DFS',
    dataStructure: 'Stack (LIFO)',
    guarantee: 'Not Guaranteed',
    evalFn: 'None (Deep Corridors First)',
    description: 'Explores deepest reachable corridor branches before backtracking. Often produces lengthy and circuitous routes.'
  },
  {
    id: 'GREEDY',
    name: 'Greedy Best-First Search',
    acronym: 'Greedy',
    dataStructure: 'Priority Queue (Min-Heap by h)',
    guarantee: 'Not Guaranteed',
    evalFn: 'f(n) = h(n) [Distance to Nearest Exit]',
    description: 'Prioritizes nodes geographically closest to an exit. Very fast in open areas, but vulnerable to being trapped by dead-ends.'
  }
]

function EvacuationSimulationView({
  grid = DEFAULT_GRID,
  setGrid,
  selectedAlgorithm = 'BFS',
  setSelectedAlgorithm,
  selectedBuilding = 'bldg-1',
  onRecordSimulation,
  setActivePage
}) {
  const currentGrid = grid || DEFAULT_GRID

  // Local state for interactive algorithm run and playback
  const [activeAlgo, setActiveAlgo] = useState(selectedAlgorithm || 'BFS')
  const [simulationResult, setSimulationResult] = useState(null)
  const [animStep, setAnimStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1) // 0.5x, 1x, 2x, 3x

  // Dynamic hazard simulation state
  const [hazardAlert, setHazardAlert] = useState(null)

  // Validate the active grid
  const validation = useMemo(() => validateGrid(currentGrid), [currentGrid])
  const isGridReady = validation.isValid && validation.algorithmReady

  // Reset simulation when the grid changes
  const prevGridRef = useRef(currentGrid)
  useEffect(() => {
    if (prevGridRef.current !== currentGrid) {
      prevGridRef.current = currentGrid
      setSimulationResult(null)
      setAnimStep(0)
      setIsPlaying(false)
      setHazardAlert(null)
    }
  }, [currentGrid])

  // Run the selected algorithm on the current grid
  const handleExecuteAlgorithm = useCallback((algoToRun = activeAlgo) => {
    if (!isGridReady) return

    setHazardAlert(null)
    setIsPlaying(false)

    // Execute real algorithm on grid snapshot
    const gridSnapshot = cloneGrid(currentGrid)
    const result = runAlgorithm(algoToRun, gridSnapshot)
    setSimulationResult(result)
    setAnimStep(0)

    // Record the simulation run centrally
    if (onRecordSimulation) {
      const matchingPreset = PRESETS.find((p) => p.id === selectedBuilding)
      onRecordSimulation({
        algorithm: algoToRun,
        gridSnapshot,
        result,
        buildingName: matchingPreset ? matchingPreset.name : 'Custom Floor Plan',
        source: 'Simulation Engine'
      })
    }

    // Auto-start playback if route was found or search was executed
    setIsPlaying(true)
  }, [isGridReady, currentGrid, activeAlgo, onRecordSimulation, selectedBuilding])

  // Total steps in the animation: explored nodes + route nodes
  const totalExplored = simulationResult?.explored?.length || 0
  const totalRoute = simulationResult?.success ? (simulationResult?.path?.length || 0) : 0
  const totalSteps = totalExplored + totalRoute

  // Playback timer effect with complete cleanup
  useEffect(() => {
    if (!isPlaying || !simulationResult || totalSteps === 0) {
      return
    }

    const baseDelayMs = 45
    const delay = Math.max(12, Math.round(baseDelayMs / playbackSpeed))

    const timerId = setInterval(() => {
      setAnimStep((current) => {
        if (current >= totalSteps) {
          setIsPlaying(false)
          return totalSteps
        }
        return current + 1
      })
    }, delay)

    return () => clearInterval(timerId)
  }, [isPlaying, simulationResult, totalSteps, playbackSpeed])

  // Derive visible visited nodes, current route, and evacuee position from animStep
  const { displayedExplored, displayedPath, currentFrontierHead, evacueeCoord } = useMemo(() => {
    if (!simulationResult) {
      return {
        displayedExplored: [],
        displayedPath: [],
        currentFrontierHead: null,
        evacueeCoord: null
      }
    }

    // Visited exploration slice
    const expCount = Math.min(animStep, totalExplored)
    const expList = simulationResult.explored.slice(0, expCount)

    // Route progress slice
    let pathList = []
    let evacuee = null
    if (animStep > totalExplored && simulationResult.success) {
      const pCount = Math.min(animStep - totalExplored, totalRoute)
      pathList = simulationResult.path.slice(0, pCount)
      if (pCount > 0) {
        evacuee = simulationResult.path[pCount - 1]
      }
    }

    const frontierHead = expCount > 0 && expCount <= totalExplored ? expList[expCount - 1] : null

    return {
      displayedExplored: expList,
      displayedPath: pathList,
      currentFrontierHead: frontierHead,
      evacueeCoord: evacuee
    }
  }, [simulationResult, animStep, totalExplored, totalRoute])

  // Lookups for fast cell styling
  const { pathSet, pathOrderMap, exploredSet } = useMemo(() => {
    const pSet = new Set()
    const pOrder = new Map()
    const eSet = new Set()

    displayedPath.forEach((coord, idx) => {
      const key = `${coord.row},${coord.col}`
      pSet.add(key)
      pOrder.set(key, idx)
    })

    displayedExplored.forEach((coord) => {
      eSet.add(`${coord.row},${coord.col}`)
    })

    return { pathSet: pSet, pathOrderMap: pOrder, exploredSet: eSet }
  }, [displayedExplored, displayedPath])

  // Playback control handlers
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      if (animStep >= totalSteps) {
        setAnimStep(0)
      }
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    setAnimStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const handleReset = () => {
    setIsPlaying(false)
    setAnimStep(0)
    setHazardAlert(null)
  }

  const handleShowFull = () => {
    setIsPlaying(false)
    setAnimStep(totalSteps)
  }

  // Dynamic Hazard Simulation Handler (Task 1.E)
  // Safely injects a simulated obstacle/fire on the remaining path or corridor and dynamically recalculates route
  const handleSimulateHazardEncounter = () => {
    if (!simulationResult || !simulationResult.success) return

    // Find the next cell on the route ahead of the evacuee (or a remaining route cell)
    const remainingPath = simulationResult.path.slice(
      animStep > totalExplored ? Math.max(0, animStep - totalExplored) : 1
    )

    if (remainingPath.length === 0) {
      setHazardAlert({
        type: 'info',
        message: 'Evacuee has already reached or exited the building. No hazard can block the path.'
      })
      return
    }

    // Pick the cell directly ahead
    const targetCell = remainingPath[Math.min(1, remainingPath.length - 1)]

    // Check if target is an exit — do not convert exit to fire directly, convert adjacent corridor instead
    let hazardRow = targetCell.row
    let hazardCol = targetCell.col

    if (currentGrid[hazardRow][hazardCol] === CELL_TYPES.EXIT && remainingPath.length > 1) {
      hazardRow = remainingPath[0].row
      hazardCol = remainingPath[0].col
    }

    // Create a modified grid with newly blocked cell
    const modifiedGrid = cloneGrid(currentGrid)
    modifiedGrid[hazardRow][hazardCol] = CELL_TYPES.FIRE

    // Revalidate and attempt live recalculation
    setIsPlaying(false)
    if (setGrid) {
      setGrid(modifiedGrid)
    }

    // Calculate new route from evacuee's current location or original start
    const newResult = runAlgorithm(activeAlgo, modifiedGrid)

    if (newResult.success) {
      setSimulationResult(newResult)
      setAnimStep(0)
      setHazardAlert({
        type: 'warning',
        message: `Dynamic Fire Hazard detected at [R${hazardRow + 1}, C${hazardCol + 1}]. Evacuation route dynamically recalculated avoiding the new hazard!`
      })
      setIsPlaying(true)
    } else {
      setSimulationResult(newResult)
      setAnimStep(0)
      setHazardAlert({
        type: 'danger',
        message: `Dynamic Fire Hazard at [R${hazardRow + 1}, C${hazardCol + 1}] blocked all safe egress! NO SAFE ROUTE exists.`
      })
    }

    // Record the dynamic hazard run in history
    if (onRecordSimulation) {
      onRecordSimulation({
        algorithm: activeAlgo,
        gridSnapshot: modifiedGrid,
        result: newResult,
        buildingName: `${selectedBuilding} (Dynamic Hazard Incident)`,
        source: 'Simulation Engine'
      })
    }
  }

  // Animation phase status helpers
  const isFinished = animStep >= totalSteps && totalSteps > 0
  const isTracingRoute = animStep > totalExplored && !isFinished
  const isExploring = animStep > 0 && animStep <= totalExplored

  const currentAlgoConfig = ALGORITHM_CONFIGS.find((a) => a.id === activeAlgo) || ALGORITHM_CONFIGS[0]

  return (
    <div className="evacuation-simulation-view-container">
      {/* 1. Header Card */}
      <div className="simulation-header-card">
        <div className="sim-header-top">
          <div>
            <div className="stage-milestone-pill">
              <span className="milestone-dot"></span>
              <span>Interactive Evacuation Simulation Engine</span>
            </div>
            <h2 className="sim-page-title">Real-Time Egress Simulation & Traversal Engine</h2>
            <p className="sim-page-subtitle">
              Execute <strong>{currentAlgoConfig.name}</strong>, inspect real graph exploration frontiers,
              and watch step-by-step route traversal under verified 4-directional spatial constraints.
            </p>
          </div>

          <div className="sim-header-actions">
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
              onClick={() => setActivePage('history')}
            >
              View History →
            </button>
          </div>
        </div>

        {/* Algorithm Selection Pills */}
        <div className="sim-algo-selector-row">
          <span className="selector-prefix-label">Search Algorithm:</span>
          <div className="sim-algo-pills">
            {ALGORITHM_CONFIGS.map((algo) => (
              <button
                key={algo.id}
                type="button"
                className={`sim-algo-pill ${activeAlgo === algo.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveAlgo(algo.id)
                  if (setSelectedAlgorithm) setSelectedAlgorithm(algo.id)
                }}
              >
                <span className="pill-code">{algo.acronym}</span>
                <span className="pill-name">{algo.name}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`execute-sim-btn ${isGridReady ? 'btn-ready' : 'btn-disabled'}`}
            onClick={() => handleExecuteAlgorithm(activeAlgo)}
            disabled={!isGridReady}
            title={!isGridReady ? 'Grid is missing Start or Exit' : `Run ${activeAlgo} simulation`}
          >
            <span className="btn-icon">▶</span>
            <span>Run Simulation</span>
          </button>
        </div>

        {/* Hazard Alert Banner */}
        {hazardAlert && (
          <div className={`sim-alert-banner alert-${hazardAlert.type}`}>
            <span className="alert-icon">
              {hazardAlert.type === 'danger' ? '🚨' : hazardAlert.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span>{hazardAlert.message}</span>
            <button
              type="button"
              className="alert-dismiss-btn"
              onClick={() => setHazardAlert(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Validation Error Banner */}
        {!isGridReady && (
          <div className="sim-alert-banner alert-danger">
            <span className="alert-icon">⚠️</span>
            <span>
              <strong>Cannot run simulation:</strong> {validation.errors[0] || 'Floor plan must have exactly 1 Start and at least 1 Exit.'}
            </span>
            <button
              type="button"
              className="inline-nav-link"
              onClick={() => setActivePage('map')}
            >
              Fix in Floor Plan Editor →
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Simulation Layout */}
      <div className="simulation-layout-grid">
        {/* Left Column: Visual Grid & Playback Engine */}
        <div className="simulation-canvas-column">
          <div className="simulation-viewport-card">
            {/* Playback Controls Toolbar */}
            <div className="playback-toolbar">
              <div className="playback-btn-group">
                <button
                  type="button"
                  className={`playback-ctrl-btn ${isPlaying ? 'btn-pause' : 'btn-play'}`}
                  onClick={handleTogglePlay}
                  disabled={!simulationResult}
                  title={isPlaying ? 'Pause animation' : 'Start / Resume animation'}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>

                <button
                  type="button"
                  className="playback-ctrl-btn"
                  onClick={handleStepForward}
                  disabled={!simulationResult || animStep >= totalSteps}
                  title="Advance 1 step"
                >
                  ⏭ Step
                </button>

                <button
                  type="button"
                  className="playback-ctrl-btn"
                  onClick={handleReset}
                  disabled={!simulationResult || animStep === 0}
                  title="Reset to beginning"
                >
                  ↺ Reset
                </button>

                <button
                  type="button"
                  className="playback-ctrl-btn"
                  onClick={handleShowFull}
                  disabled={!simulationResult || isFinished}
                  title="Show complete path instantly"
                >
                  ⏩ Full Route
                </button>
              </div>

              {/* Speed Controller */}
              <div className="speed-control-group">
                <span className="speed-label">Speed:</span>
                {[0.5, 1, 2, 3].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    className={`speed-pill ${playbackSpeed === spd ? 'speed-active' : ''}`}
                    onClick={() => setPlaybackSpeed(spd)}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Dynamic Hazard Toggle / Trigger (Task 1.E) */}
              <div className="hazard-tool-group">
                <button
                  type="button"
                  className={`hazard-trigger-btn ${simulationResult?.success ? 'active-hazard-btn' : 'disabled-hazard-btn'}`}
                  onClick={handleSimulateHazardEncounter}
                  disabled={!simulationResult?.success}
                  title="Simulate fire outbreak ahead on route to test dynamic obstacle avoidance"
                >
                  <span className="btn-flame">🔥</span>
                  <span>Simulate Dynamic Fire</span>
                </button>
              </div>
            </div>

            {/* Playback Progress Scrubber Bar */}
            {simulationResult && (
              <div className="playback-progress-container">
                <div className="progress-info-row">
                  <span className="progress-status-text">
                    {isFinished
                      ? simulationResult.success
                        ? '✓ Evacuation traversal completed safely'
                        : '✕ Frontier exhausted with no safe exit'
                      : isTracingRoute
                        ? `Traversing Safe Route: Step ${animStep - totalExplored} of ${totalRoute}`
                        : isExploring
                          ? `Exploring Graph Frontier: Node ${animStep} of ${totalExplored}`
                          : 'Simulation Ready'}
                  </span>
                  <span className="progress-step-counter">
                    Step {animStep} / {totalSteps}
                  </span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${
                      isTracingRoute || isFinished ? 'fill-route' : 'fill-frontier'
                    }`}
                    style={{
                      width: totalSteps > 0 ? `${Math.round((animStep / totalSteps) * 100)}%` : '0%'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Interactive 14x10 Grid Canvas */}
            <div className="blueprint-viewport">
              <div className="blueprint-grid-wrapper">
                <div className="blueprint-grid">
                  {currentGrid.map((row, rIdx) => (
                    <div key={`row-${rIdx}`} className="blueprint-row">
                      {row.map((cellVal, cIdx) => {
                        const key = `${rIdx},${cIdx}`
                        const isOnPath = pathSet.has(key)
                        const isExplored = !isOnPath && exploredSet.has(key)
                        const isHead = currentFrontierHead && currentFrontierHead.row === rIdx && currentFrontierHead.col === cIdx
                        const isEvacueeHere = evacueeCoord && evacueeCoord.row === rIdx && evacueeCoord.col === cIdx
                        const pathStep = pathOrderMap.get(key)

                        const config = CELL_CONFIG[cellVal] || CELL_CONFIG[CELL_TYPES.EMPTY]
                        let dynamicClass = config.className
                        let markerContent = config.badgeText
                        let cellTitle = `[R${rIdx + 1}, C${cIdx + 1}] ${config.label}`

                        if (cellVal === CELL_TYPES.START) {
                          if (isOnPath) dynamicClass += ' cell-path-start'
                        } else if (cellVal === CELL_TYPES.EXIT) {
                          if (
                            simulationResult?.selectedExit &&
                            simulationResult.selectedExit.row === rIdx &&
                            simulationResult.selectedExit.col === cIdx &&
                            (isFinished || isOnPath)
                          ) {
                            dynamicClass += ' cell-path-exit-target'
                            cellTitle = 'Targeted Emergency Exit'
                          }
                        } else if (cellVal === CELL_TYPES.EMPTY) {
                          if (isOnPath) {
                            dynamicClass = 'blueprint-cell-path'
                            markerContent = pathStep !== undefined ? String(pathStep) : '•'
                          } else if (isExplored) {
                            dynamicClass = 'blueprint-cell-explored'
                            markerContent = '·'
                          }
                        }

                        if (isHead) {
                          dynamicClass += ' cell-frontier-head'
                        }

                        if (isEvacueeHere && cellVal !== CELL_TYPES.START) {
                          dynamicClass += ' cell-evacuee-active'
                          markerContent = '🏃'
                        }

                        return (
                          <div
                            key={`cell-${rIdx}-${cIdx}`}
                            className={`blueprint-cell ${dynamicClass}`}
                            title={cellTitle}
                          >
                            {markerContent && (
                              <span className="cell-marker">{markerContent}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Legend */}
            <div className="map-legend">
              <div className="legend-title">Topology & Simulation Legend:</div>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-swatch swatch-walkable"></span>
                  <span>Corridor</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch swatch-wall"></span>
                  <span>Wall</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch swatch-start"></span>
                  <span>Evacuee Start</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch swatch-exit"></span>
                  <span>Emergency Exit</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch swatch-hazard"></span>
                  <span>Fire Hazard</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch swatch-blocked"></span>
                  <span>Blocked Passage</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch swatch-explored"></span>
                  <span>Frontier Visited</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch swatch-path"></span>
                  <span>Safe Egress Route</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch swatch-frontier-head"></span>
                  <span>Frontier Head</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Metrics & Algorithm Telemetry */}
        <div className="simulation-metrics-column">
          {/* Active Algorithm Profile Card */}
          <div className="sim-side-card">
            <div className="side-card-header">
              <span className="card-tag">{currentAlgoConfig.acronym}</span>
              <h3 className="card-title">{currentAlgoConfig.name}</h3>
            </div>
            <p className="card-desc">{currentAlgoConfig.description}</p>
            <div className="side-specs-list">
              <div className="side-spec">
                <span className="spec-name">Internal Frontier:</span>
                <span className="spec-val"><code>{currentAlgoConfig.dataStructure}</code></span>
              </div>
              <div className="side-spec">
                <span className="spec-name">Optimality:</span>
                <span className={`spec-badge ${currentAlgoConfig.guarantee === 'Guaranteed Shortest' ? 'badge-optimal' : 'badge-suboptimal'}`}>
                  {currentAlgoConfig.guarantee}
                </span>
              </div>
              <div className="side-spec">
                <span className="spec-name">Evaluation:</span>
                <span className="spec-val mono-val">{currentAlgoConfig.evalFn}</span>
              </div>
            </div>
          </div>

          {/* Live Run Metrics Panel */}
          <div className="sim-side-card">
            <div className="side-card-header">
              <h3 className="card-title">Run Telemetry & Metrics</h3>
              <span className={`status-pill ${
                !simulationResult
                  ? 'status-pill-fail'
                  : simulationResult.success
                    ? 'status-pill-success'
                    : 'status-pill-fail'
              }`}>
                {!simulationResult ? 'Awaiting Run' : simulationResult.success ? 'Safe Route' : 'No Safe Route'}
              </span>
            </div>

            <div className="sim-metrics-grid">
              <div className="sim-metric-box">
                <span className="metric-lbl">Route Length</span>
                <div className="metric-val-row">
                  <span className="metric-num">
                    {simulationResult ? (simulationResult.success ? simulationResult.pathLength : 0) : '—'}
                  </span>
                  <span className="metric-sub">moves</span>
                </div>
                <span className="metric-hint">
                  {simulationResult?.success ? `${simulationResult.path.length} grid cells` : 'No egress'}
                </span>
              </div>

              <div className="sim-metric-box">
                <span className="metric-lbl">Nodes Explored</span>
                <div className="metric-val-row">
                  <span className="metric-num">
                    {simulationResult ? simulationResult.exploredCount : '—'}
                  </span>
                  <span className="metric-sub">nodes</span>
                </div>
                <span className="metric-hint">Frontier states dequeued</span>
              </div>

              <div className="sim-metric-box">
                <span className="metric-lbl">Algorithm Compute Time</span>
                <div className="metric-val-row">
                  <span className="metric-num">
                    {simulationResult ? simulationResult.executionTimeMs : '—'}
                  </span>
                  <span className="metric-sub">ms</span>
                </div>
                <span className="metric-hint">performance.now() measurement</span>
              </div>

              <div className="sim-metric-box">
                <span className="metric-lbl">Target Emergency Exit</span>
                <div className="metric-val-row">
                  <span className="metric-num exit-coord-text">
                    {simulationResult?.selectedExit
                      ? `[R${simulationResult.selectedExit.row + 1}, C${simulationResult.selectedExit.col + 1}]`
                      : 'None'}
                  </span>
                </div>
                <span className="metric-hint">Selected safe door</span>
              </div>
            </div>

            {simulationResult && (
              <div className="sim-message-box">
                <p className="message-content">{simulationResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EvacuationSimulationView