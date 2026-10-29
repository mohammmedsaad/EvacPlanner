function PlaceholderView({ pageId, setActivePage }) {
  const stageInfoMap = {
    map: {
      title: 'Building Map Architecture',
      stage: 'Stage 3',
      description: 'Interactive floor plan editor, custom grid dimension configuration, wall drawing, and dynamic exit placement.',
      roadmap: [
        'Interactive 2D Canvas / SVG grid editor',
        'Brush tools: Wall, Corridor, Evacuee Start, Emergency Exit, Fire Hazard',
        'Custom building blueprints and floor preset loaders',
        'Graph adjacency matrix and neighbor node mapping'
      ]
    },
    simulation: {
      title: 'Evacuation Simulation Engine',
      stage: 'Stage 4',
      description: 'Real-time execution of BFS, DFS, A*, and Greedy Best-First Search with step-by-step path traversal animation.',
      roadmap: [
        'Step-by-step visual frontier expansion (Visited & Frontier nodes)',
        'Playback controls (Play, Pause, Step Forward, Speed Slider)',
        'Dynamic fire spread propagation across building corridors',
        'Live route recalculation upon encountering newly blocked paths'
      ]
    },
    history: {
      title: 'Simulation History & Logs',
      stage: 'Stage 5',
      description: 'Detailed session logs, archived benchmark exports, and downloadable run telemetry.',
      roadmap: [
        'Session run history with replay capability',
        'Telemetry export (JSON / CSV benchmark reports)',
        'Per-run parameter logs (fire spread speed, start/exit coordinates)'
      ]
    }
  }

  const info = stageInfoMap[pageId] || {
    title: 'Module Under Development',
    stage: 'Future Stage',
    description: 'This feature will be built in an upcoming milestone.',
    roadmap: ['Under active development as part of the capstone roadmap.']
  }

  return (
    <div className="placeholder-view-container">
      <div className="placeholder-card">
        <div className="placeholder-badge">{info.stage} Feature</div>
        <h2 className="placeholder-title">{info.title}</h2>
        <p className="placeholder-subtitle">{info.description}</p>

        <div className="roadmap-box">
          <h3 className="roadmap-heading">Planned Capabilities for this Stage:</h3>
          <ul className="roadmap-list">
            {info.roadmap.map((item, idx) => (
              <li key={idx} className="roadmap-item">
                <span className="check-icon" aria-hidden="true">⏳</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="placeholder-actions">
          <button
            type="button"
            className="return-dashboard-btn"
            onClick={() => setActivePage('dashboard')}
          >
            ← Return to Operations Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderView
