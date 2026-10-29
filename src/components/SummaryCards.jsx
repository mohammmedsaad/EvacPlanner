import { CELL_TYPES, DEFAULT_GRID } from '../constants/gridConstants'

function SummaryCards({ grid = DEFAULT_GRID, simulationResult = null }) {
  const currentGrid = grid || DEFAULT_GRID

  // Compute live metrics from the floor plan
  let exitCount = 0
  let hazardCount = 0

  for (let r = 0; r < currentGrid.length; r++) {
    for (let c = 0; c < currentGrid[r].length; c++) {
      if (currentGrid[r][c] === CELL_TYPES.EXIT) {
        exitCount++
      } else if (currentGrid[r][c] === CELL_TYPES.FIRE || currentGrid[r][c] === CELL_TYPES.BLOCKED) {
        hazardCount++
      }
    }
  }

  const hasResult = Boolean(simulationResult)
  const isSuccess = simulationResult?.success

  const cards = [
    {
      id: 'buildings',
      title: 'Buildings Configured',
      value: '3',
      unit: 'Facilities',
      subtitle: 'Blueprint presets available',
      type: 'neutral',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18"></path>
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
          <path d="M9 9h1"></path>
          <path d="M9 13h1"></path>
          <path d="M9 17h1"></path>
          <path d="M14 9h1"></path>
          <path d="M14 13h1"></path>
          <path d="M14 17h1"></path>
        </svg>
      )
    },
    {
      id: 'exits',
      title: 'Emergency Exits',
      value: String(exitCount),
      unit: 'Doors Marked',
      subtitle: exitCount > 0 ? 'Verified egress points' : 'Warning: 0 exits placed',
      type: exitCount > 0 ? 'success' : 'danger',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'hazards',
      title: 'Active Hazards',
      value: String(hazardCount),
      unit: 'Hazard & Blocked Zones',
      subtitle: hazardCount > 0 ? 'Active spatial constraints' : 'Clear corridor paths',
      type: hazardCount > 0 ? 'danger' : 'neutral',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
      )
    },
    {
      id: 'last-sim',
      title: 'Last Simulation',
      value: hasResult ? (isSuccess ? `${simulationResult.pathLength} moves` : 'No Route') : 'None',
      unit: hasResult ? `${simulationResult.algorithm} (${simulationResult.executionTimeMs}ms)` : 'Ready',
      subtitle: hasResult
        ? isSuccess
          ? `Exit reached • ${simulationResult.exploredCount} explored`
          : 'All exits obstructed'
        : 'Click Run to simulate',
      type: hasResult ? (isSuccess ? 'success' : 'danger') : 'neutral',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    }
  ]

  return (
    <section className="summary-cards-grid" aria-label="Building overview metrics">
      {cards.map((card) => (
        <div key={card.id} className={`summary-card card-${card.type}`}>
          <div className="summary-card-header">
            <span className="summary-card-title">{card.title}</span>
            <span className="summary-card-icon" aria-hidden="true">{card.icon}</span>
          </div>
          <div className="summary-card-body">
            <span className="summary-card-value">{card.value}</span>
            <span className="summary-card-unit">{card.unit}</span>
          </div>
          <div className="summary-card-footer">
            <span className="demo-tag">{card.subtitle}</span>
          </div>
        </div>
      ))}
    </section>
  )
}

export default SummaryCards
