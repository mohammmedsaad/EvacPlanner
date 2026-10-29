function Header({ activePage, selectedBuilding, setSelectedBuilding, setIsMobileOpen }) {
  const pageMeta = {
    dashboard: {
      title: 'Operations Dashboard',
      description: 'Overview of building topologies, exit pathways, and search algorithm status.'
    },
    map: {
      title: 'Building Map Architecture',
      description: 'Detailed topological layout and grid configuration for building structures.'
    },
    simulation: {
      title: 'Evacuation Simulation Engine',
      description: 'Step-by-step path traversal simulation under dynamic hazard constraints.'
    },
    history: {
      title: 'Simulation History Logs',
      description: 'Archived execution records and historical benchmark runs.'
    },
    about: {
      title: 'About the Project',
      description: 'Educational background, AI capstone objectives, and system disclaimer.'
    }
  }

  const currentMeta = pageMeta[activePage] || {
    title: 'Emergency Building Evacuation Planner',
    description: 'AI-driven emergency evacuation route simulation.'
  }

  const buildings = [
    { id: 'bldg-1', name: 'Engineering Complex Block A (Sample)' },
    { id: 'bldg-2', name: 'Science Laboratory Hall (Sample)' },
    { id: 'bldg-3', name: 'Central Library Tower (Sample)' }
  ]

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="header-titles">
          <h1 className="page-title">{currentMeta.title}</h1>
          <p className="page-description">{currentMeta.description}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="building-selector-wrapper">
          <label htmlFor="building-select" className="selector-label">Target Facility:</label>
          <div className="select-container">
            <select
              id="building-select"
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="building-select"
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <span className="select-arrow" aria-hidden="true">▾</span>
          </div>
        </div>

        <div className="status-badge" title="Stage 2 visual interface baseline">
          <span className="status-dot"></span>
          <span className="status-text">Demo Mode • UI Phase</span>
        </div>
      </div>
    </header>
  )
}

export default Header
