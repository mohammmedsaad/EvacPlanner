import { useState, useEffect } from 'react'
import {
  CELL_TYPES,
  CELL_CONFIG,
  EDIT_TOOLS,
  PRESETS
} from '../constants/gridConstants'
import {
  cloneGrid,
  validateGrid,
  applyToolToCell,
  createEmptyGrid,
  formatCoord
} from '../utils/gridUtils'

function BuildingMapView({ grid, setGrid, selectedBuilding, setActivePage }) {
  const [activeTool, setActiveTool] = useState(CELL_TYPES.WALL)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [hoveredCell, setHoveredCell] = useState(null)

  // Validate the current grid state
  const validation = validateGrid(grid)

  // Listen for mouse up anywhere in the window to stop drag-painting
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false)
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const handleCellClick = (r, c) => {
    const updated = applyToolToCell(grid, r, c, activeTool)
    setGrid(updated)
  }

  const handleCellMouseEnter = (r, c) => {
    setHoveredCell({ row: r, col: c })
    if (isMouseDown) {
      const updated = applyToolToCell(grid, r, c, activeTool)
      setGrid(updated)
    }
  }

  const handleCellMouseDown = (r, c, e) => {
    e.preventDefault()
    setIsMouseDown(true)
    const updated = applyToolToCell(grid, r, c, activeTool)
    setGrid(updated)
  }

  const handleResetToDefault = () => {
    // Restore default layout matching currently selected building or default
    const matchingPreset = PRESETS.find((p) => p.id === selectedBuilding) || PRESETS[0]
    setGrid(cloneGrid(matchingPreset.layout))
    setShowResetConfirm(false)
  }

  const handleClearToWalkable = () => {
    setGrid(createEmptyGrid(grid.length, grid[0].length))
  }

  const handlePresetSelect = (presetId) => {
    const preset = PRESETS.find((p) => p.id === presetId)
    if (preset) {
      setGrid(cloneGrid(preset.layout))
    }
  }

  const getCellDisplay = (type) => {
    return CELL_CONFIG[type] || CELL_CONFIG[CELL_TYPES.EMPTY]
  }

  return (
    <div className="building-map-view-container">
      {/* 1. Header Information & Stage Notice */}
      <div className="map-view-header-card">
        <div className="map-header-top">
          <div>
            <div className="stage-milestone-pill">
              <span className="milestone-dot"></span>
              <span>Stage 4 • Movement Rules & Data Model</span>
            </div>
            <h2 className="map-view-title">Interactive Building Floor Plan Editor</h2>
            <p className="map-view-subtitle">
              Design, modify, and configure discrete 2D spatial layouts for emergency evacuation analysis.
              Place structural barriers, emergency exits, evacuee origins, and hazard zones with 4-directional movement validation.
            </p>
          </div>

          <div className="preset-selector-box">
            <label htmlFor="floor-preset-select" className="preset-label">Floor Plan Blueprint:</label>
            <div className="select-container">
              <select
                id="floor-preset-select"
                value={selectedBuilding}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="building-select"
              >
                {PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <span className="select-arrow" aria-hidden="true">▾</span>
            </div>
          </div>
        </div>

        {/* Stage 4 Notice Banner */}
        <div className="stage-notice-banner">
          <div className="banner-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <p className="banner-text">
            <strong>Stage 4 Notice:</strong> 4-directional movement rules (Up, Right, Down, Left), cell traversability, and spatial data model are validated.
            Evacuation search algorithms (BFS, DFS, A*, Greedy) will execute in <strong>Stage 5</strong>.
          </p>
        </div>

        {/* Validation Status Banner */}
        {!validation.isValid ? (
          <div className="validation-banner banner-error">
            <div className="validation-icon" aria-hidden="true">⚠️</div>
            <div className="validation-content">
              <span className="validation-title">Floor Plan Validation Incomplete</span>
              <ul className="validation-list">
                {validation.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="validation-banner banner-success">
            <div className="validation-icon" aria-hidden="true">✓</div>
            <div className="validation-content">
              <span className="validation-title">Floor Plan Valid & Algorithm-Ready</span>
              <p className="validation-desc">
                Configuration verified for 4-directional evacuation traversal: 1 Evacuee Start location at {formatCoord(validation.startPosition)},{' '}
                {validation.counts.exit} Emergency Exit{validation.counts.exit > 1 ? 's' : ''}, and{' '}
                {validation.counts.fire} Hazard zone{validation.counts.fire > 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Editor Workspace: Left Tools & Stats, Right Grid Canvas */}
      <div className="editor-workspace-layout">
        {/* Left Column: Tool Palette, Quick Controls & Stats */}
        <div className="editor-controls-column">
          {/* Tool Palette */}
          <div className="editor-card tool-palette-card">
            <div className="card-header">
              <h3 className="card-title">Cell Placement Tools</h3>
              <span className="card-helper-tag">Click to Select</span>
            </div>
            <p className="card-desc">
              Select a tool below, then click or drag across grid cells to edit the layout.
            </p>

            <div className="tools-grid">
              {EDIT_TOOLS.map((tool) => {
                const isActive = activeTool === tool.type
                return (
                  <button
                    key={tool.type}
                    type="button"
                    className={`tool-button ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTool(tool.type)}
                    title={tool.hint}
                  >
                    <div className="tool-btn-header">
                      <span className="tool-swatch" style={{ backgroundColor: tool.color }} />
                      <span className="tool-name">{tool.label}</span>
                    </div>
                    <div className="tool-btn-footer">
                      <span className="tool-badge">{tool.badge}</span>
                      <span className="tool-hint">{tool.hint}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Actions (Reset & Clear) */}
          <div className="editor-card action-palette-card">
            <div className="card-header">
              <h3 className="card-title">Grid Actions</h3>
            </div>
            
            <div className="grid-action-buttons">
              <button
                type="button"
                className="action-btn btn-reset"
                onClick={() => setShowResetConfirm(true)}
              >
                <span className="btn-icon" aria-hidden="true">↺</span>
                <span>Reset to Default Layout</span>
              </button>

              <button
                type="button"
                className="action-btn btn-clear"
                onClick={handleClearToWalkable}
              >
                <span className="btn-icon" aria-hidden="true">⌧</span>
                <span>Clear Internal Floor</span>
              </button>

              <button
                type="button"
                className="action-btn btn-return-dash"
                onClick={() => setActivePage('dashboard')}
              >
                <span className="btn-icon" aria-hidden="true">←</span>
                <span>Return to Operations Dashboard</span>
              </button>
            </div>
          </div>

          {/* Live Floor Plan Statistics */}
          <div className="editor-card stats-card">
            <div className="card-header">
              <h3 className="card-title">Floor Plan Metrics</h3>
              <span className="card-helper-tag">{grid.length} × {grid[0].length} Grid</span>
            </div>

            <div className="editor-metrics-grid">
              <div className="metric-pill">
                <span className="metric-k">Total Cells</span>
                <span className="metric-v">{validation.counts.total}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-k">Walkable</span>
                <span className="metric-v color-walkable">{validation.counts.walkable}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-k">Walls</span>
                <span className="metric-v color-wall">{validation.counts.wall}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-k">Start</span>
                <span className={`metric-v ${validation.counts.start === 1 ? 'color-start' : 'color-danger'}`}>
                  {formatCoord(validation.startPosition)}
                </span>
              </div>
              <div className="metric-pill">
                <span className="metric-k">Exits</span>
                <span className={`metric-v ${validation.counts.exit >= 1 ? 'color-exit' : 'color-danger'}`}>
                  {validation.counts.exit}
                </span>
              </div>
              <div className="metric-pill">
                <span className="metric-k">Hazards</span>
                <span className="metric-v color-danger">{validation.counts.fire}</span>
              </div>
              <div className="metric-pill">
                <span className="metric-k">Blocked</span>
                <span className="metric-v color-blocked">{validation.counts.blocked}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Grid Canvas */}
        <div className="editor-canvas-column">
          <div className="editor-card canvas-card">
            <div className="canvas-header">
              <div>
                <h3 className="card-title">Building 2D Floor Plan Blueprint</h3>
                <span className="canvas-instruction">
                  Active Tool: <strong>{CELL_CONFIG[activeTool]?.label}</strong> • Click or drag to paint
                </span>
              </div>

              {hoveredCell && (
                <div className="hover-coord-tag">
                  Hover: [Row {hoveredCell.row + 1}, Col {hoveredCell.col + 1}] —{' '}
                  <span className="coord-type">{CELL_CONFIG[grid[hoveredCell.row][hoveredCell.col]]?.shortLabel}</span>
                </div>
              )}
            </div>

            {/* Interactive Grid Viewport */}
            <div
              className="interactive-grid-viewport"
              onMouseLeave={() => setHoveredCell(null)}
            >
              <div className="grid-with-coordinates">
                {/* Column index header */}
                <div className="col-header-row">
                  <div className="corner-spacer" />
                  {grid[0].map((_, cIdx) => (
                    <div key={`col-hdr-${cIdx}`} className="col-index-marker">
                      {cIdx + 1}
                    </div>
                  ))}
                </div>

                {/* Grid rows with row index markers */}
                <div className="interactive-grid-body">
                  {grid.map((row, rIdx) => (
                    <div key={`row-${rIdx}`} className="interactive-grid-row">
                      <div className="row-index-marker">{rIdx + 1}</div>
                      {row.map((cellType, cIdx) => {
                        const config = getCellDisplay(cellType)
                        return (
                          <div
                            key={`cell-${rIdx}-${cIdx}`}
                            className={`interactive-cell ${config.className}`}
                            title={`[R${rIdx + 1}, C${cIdx + 1}] ${config.label}`}
                            onClick={() => handleCellClick(rIdx, cIdx)}
                            onMouseDown={(e) => handleCellMouseDown(rIdx, cIdx, e)}
                            onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx)}
                          >
                            {config.badgeText && (
                              <span className="cell-marker">{config.badgeText}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Complete Cell Type Topology Legend */}
            <div className="interactive-legend-section">
              <div className="legend-section-title">Floor Plan Topology Legend:</div>
              <div className="legend-cards-grid">
                {Object.values(CELL_CONFIG).map((item) => (
                  <div key={item.type} className="legend-cell-item">
                    <span className={`legend-swatch ${item.legendClass}`} />
                    <div className="legend-text-group">
                      <span className="legend-name">{item.label}</span>
                      <span className="legend-desc">{item.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon" aria-hidden="true">↺</span>
              <h3 className="modal-title">Reset Grid to Default Blueprint?</h3>
            </div>
            <p className="modal-body">
              This action will reset the floor plan back to its original layout (<strong>Engineering Complex Block A</strong>).
              Any custom walls, exits, or hazards you have placed will be overwritten.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={handleResetToDefault}
              >
                Yes, Restore Default Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuildingMapView
