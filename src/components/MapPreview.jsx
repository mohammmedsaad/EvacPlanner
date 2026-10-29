import { useState, useEffect, useMemo } from 'react'
import { CELL_TYPES, CELL_CONFIG, DEFAULT_GRID } from '../constants/gridConstants'

function MapPreview({ grid = DEFAULT_GRID, setActivePage, simulationResult = null }) {
  const displayGrid = grid || DEFAULT_GRID

  // Animation playback state
  const [animStep, setAnimStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1) // 0.5x, 1x, 2x

  // Reset/sync animation when simulationResult or grid prop changes (React recommended pattern)
  const [prevResult, setPrevResult] = useState(simulationResult)
  const [prevGrid, setPrevGrid] = useState(grid)

  if (simulationResult !== prevResult) {
    setPrevResult(simulationResult)
    setAnimStep(0)
    setIsPlaying(Boolean(simulationResult))
  }

  if (grid !== prevGrid) {
    setPrevGrid(grid)
    setAnimStep(0)
    setIsPlaying(false)
  }

  // Total steps in the animation: explored nodes + route steps
  const totalExplored = simulationResult?.explored?.length || 0
  const totalRoute = simulationResult?.success ? (simulationResult?.path?.length || 0) : 0
  const totalSteps = totalExplored + totalRoute

  // Animation Timer Hook (cleans up safely on unmount or pause)
  useEffect(() => {
    if (!isPlaying || !simulationResult || totalSteps === 0) {
      return
    }

    const baseDelayMs = 45
    const delay = Math.max(10, Math.round(baseDelayMs / playbackSpeed))

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

  // Derive visible subsets based on current animStep
  const { displayedExplored, displayedPath, currentHeadCoord } = useMemo(() => {
    if (!simulationResult) {
      return { displayedExplored: [], displayedPath: [], currentHeadCoord: null }
    }

    // Number of explored nodes to show
    const expCount = Math.min(animStep, totalExplored)
    const expList = simulationResult.explored.slice(0, expCount)

    // Number of path steps to show
    let pathList = []
    if (animStep > totalExplored && simulationResult.success) {
      const pCount = Math.min(animStep - totalExplored, totalRoute)
      pathList = simulationResult.path.slice(0, pCount)
    }

    const head = expCount > 0 && expCount <= totalExplored ? expList[expCount - 1] : null

    return {
      displayedExplored: expList,
      displayedPath: pathList,
      currentHeadCoord: head
    }
  }, [simulationResult, animStep, totalExplored, totalRoute])

  // Create lookups for rendered cells
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

  const handleResetAnimation = () => {
    setIsPlaying(false)
    setAnimStep(0)
  }

  const handleFinishAnimation = () => {
    setIsPlaying(false)
    setAnimStep(totalSteps)
  }

  // Animation phase status description
  const isFinished = animStep >= totalSteps && totalSteps > 0
  const isTracingRoute = animStep > totalExplored && !isFinished
  const isExploring = animStep > 0 && animStep <= totalExplored

  const getCellDetails = (cell, rIdx, cIdx) => {
    const key = `${rIdx},${cIdx}`
    const isOnPath = pathSet.has(key)
    const isExplored = !isOnPath && exploredSet.has(key)
    const isHead = currentHeadCoord && currentHeadCoord.row === rIdx && currentHeadCoord.col === cIdx
    const pathStep = pathOrderMap.get(key)

    const config = CELL_CONFIG[cell] || CELL_CONFIG[CELL_TYPES.EMPTY]

    let dynamicClass = config.className
    let badgeContent = config.badgeText
    let cellLabel = config.label

    if (cell === CELL_TYPES.START) {
      if (isOnPath) {
        dynamicClass += ' cell-path-start'
      }
    } else if (cell === CELL_TYPES.EXIT) {
      if (
        simulationResult?.selectedExit &&
        simulationResult.selectedExit.row === rIdx &&
        simulationResult.selectedExit.col === cIdx &&
        (isFinished || isOnPath)
      ) {
        dynamicClass += ' cell-path-exit-target'
        cellLabel = 'Selected Safe Exit'
      }
    } else if (cell === CELL_TYPES.EMPTY) {
      if (isOnPath) {
        dynamicClass = 'blueprint-cell-walkable cell-path'
        badgeContent = pathStep !== undefined ? String(pathStep) : '•'
        cellLabel = `Route Step ${pathStep} (Move ${pathStep})`
      } else if (isHead) {
        dynamicClass = 'blueprint-cell-walkable cell-explored cell-frontier-head'
        badgeContent = '◎'
        cellLabel = 'Active Search Frontier'
      } else if (isExplored) {
        dynamicClass = 'blueprint-cell-walkable cell-explored'
        badgeContent = ''
        cellLabel = 'Explored Cell'
      }
    }

    return {
      className: dynamicClass,
      label: cellLabel,
      content: badgeContent
    }
  }

  const rows = displayGrid.length
  const cols = displayGrid[0]?.length || 0

  return (
    <div className="map-preview-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <h2 className="panel-title">Building Floor Plan Preview</h2>
          <span className="live-badge">Stage 6 Visualizer</span>
        </div>
        <div className="blueprint-meta">
          <span>Grid: {cols} × {rows} Blocks</span>
          <span className="meta-sep">•</span>
          {setActivePage && (
            <button
              type="button"
              className="open-editor-btn"
              onClick={() => setActivePage('map')}
              title="Open full interactive floor plan editor"
            >
              Open Floor Plan Editor →
            </button>
          )}
        </div>
      </div>

      {/* Simulation Result Banner or Default Guidance */}
      {simulationResult ? (
        simulationResult.success ? (
          <div className="sim-result-banner banner-success-route" role="status">
            <div className="sim-banner-icon" aria-hidden="true">✓</div>
            <div className="sim-banner-content">
              <strong>{simulationResult.algorithm} Simulation Completed:</strong>{' '}
              Safe route reached Exit at [R{simulationResult.selectedExit.row + 1}, C{simulationResult.selectedExit.col + 1}] in{' '}
              <strong>{simulationResult.pathLength} moves</strong> ({simulationResult.exploredCount} frontier cells explored in {simulationResult.executionTimeMs} ms).
            </div>
          </div>
        ) : (
          <div className="sim-result-banner banner-failed-route" role="alert">
            <div className="sim-banner-icon" aria-hidden="true">⚠️</div>
            <div className="sim-banner-content">
              <strong>No Safe Route Available ({simulationResult.algorithm}):</strong>{' '}
              {simulationResult.message || 'All paths from evacuee start to emergency exits are obstructed by walls, barricades, or active fire hazards.'}
            </div>
          </div>
        )
      ) : (
        <div className="stage-notice-banner">
          <div className="banner-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <p className="banner-text">
            <strong>Stage 6 Evacuation Visualization:</strong> Select any algorithm (BFS, DFS, A*, Greedy) and click{' '}
            <strong>Run Evacuation Simulation</strong>. Use the playback controls below to play, pause, step forward, or reset the animation.
          </p>
        </div>
      )}

      {/* Interactive Step-by-Step Playback Controls */}
      {simulationResult && (
        <div className="animation-playback-toolbar" aria-label="Evacuation simulation playback controls">
          <div className="playback-controls-row">
            <div className="playback-buttons-group">
              <button
                type="button"
                className={`playback-btn btn-play-toggle ${isPlaying ? 'btn-active-pause' : 'btn-active-play'}`}
                onClick={handleTogglePlay}
                title={isPlaying ? 'Pause simulation animation' : 'Play simulation animation'}
              >
                <span className="btn-glyph" aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
                <span>{isPlaying ? 'Pause' : isFinished ? 'Replay' : 'Play'}</span>
              </button>

              <button
                type="button"
                className="playback-btn btn-step"
                onClick={handleStepForward}
                disabled={isFinished}
                title="Step forward 1 node/move"
              >
                <span className="btn-glyph" aria-hidden="true">⏭</span>
                <span>Step Forward</span>
              </button>

              <button
                type="button"
                className="playback-btn btn-reset-anim"
                onClick={handleResetAnimation}
                title="Reset animation to beginning"
              >
                <span className="btn-glyph" aria-hidden="true">↺</span>
                <span>Reset</span>
              </button>

              <button
                type="button"
                className="playback-btn btn-finish-anim"
                onClick={handleFinishAnimation}
                disabled={isFinished}
                title="Jump directly to final route"
              >
                <span className="btn-glyph" aria-hidden="true">⏩</span>
                <span>Show Full</span>
              </button>
            </div>

            {/* Playback Speed Controls */}
            <div className="playback-speed-group" role="radiogroup" aria-label="Playback speed">
              <span className="speed-label">Speed:</span>
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  className={`speed-pill-btn ${playbackSpeed === spd ? 'active' : ''}`}
                  onClick={() => setPlaybackSpeed(spd)}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Animation Progress Scrub Bar */}
          <div className="playback-progress-row">
            <div className="progress-info-line">
              <span className="phase-indicator-text">
                {isExploring && (
                  <>
                    <span className="phase-badge phase-exploring">Exploration Phase</span>
                    <span>Visiting frontier node <strong>{animStep}</strong> of {totalExplored}</span>
                  </>
                )}
                {isTracingRoute && (
                  <>
                    <span className="phase-badge phase-route">Route Phase</span>
                    <span>Drawing route step <strong>{animStep - totalExplored}</strong> of {totalRoute - 1} moves</span>
                  </>
                )}
                {isFinished && (
                  <>
                    <span className="phase-badge phase-completed">Completed</span>
                    <span>
                      {simulationResult.success
                        ? `Shortest safe path rendered (${simulationResult.pathLength} moves, ${totalExplored} explored)`
                        : `Frontier exhausted (${totalExplored} nodes explored, no safe exit reachable)`}
                    </span>
                  </>
                )}
                {animStep === 0 && (
                  <>
                    <span className="phase-badge phase-ready">Ready</span>
                    <span>Click <strong>Play</strong> or <strong>Step</strong> to start evacuation traversal</span>
                  </>
                )}
              </span>

              <span className="progress-count-tag">
                Step {animStep} / {totalSteps}
              </span>
            </div>

            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: totalSteps > 0 ? `${Math.round((animStep / totalSteps) * 100)}%` : '0%'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid Viewport */}
      <div className="blueprint-viewport" aria-label="Floor plan architectural preview">
        <div className="blueprint-grid-wrapper">
          <div className="blueprint-grid">
            {displayGrid.map((row, rIdx) => (
              <div key={`row-${rIdx}`} className="blueprint-row">
                {row.map((cellVal, cIdx) => {
                  const details = getCellDetails(cellVal, rIdx, cIdx)
                  return (
                    <div
                      key={`cell-${rIdx}-${cIdx}`}
                      className={`blueprint-cell ${details.className}`}
                      title={`[R${rIdx + 1}, C${cIdx + 1}] ${details.label}`}
                    >
                      {details.content && (
                        <span className="cell-marker">{details.content}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-title">Topology & Route Legend:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-swatch swatch-walkable"></span>
            <span>Corridor</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-wall"></span>
            <span>Wall / Barrier</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-start"></span>
            <span>Start</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-exit"></span>
            <span>Exit</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-hazard"></span>
            <span>Fire Hazard</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-blocked"></span>
            <span>Blocked</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-path"></span>
            <span>Evacuation Route</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-explored"></span>
            <span>Explored Node</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-frontier-head"></span>
            <span>Frontier Head</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapPreview
