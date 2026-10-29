function AboutView() {
  const algorithms = [
    {
      name: 'Breadth-First Search (BFS)',
      type: 'Uninformed / Brute-Force',
      mechanism: 'Explores the graph using a First-In-First-Out (FIFO) queue level by level.',
      properties: 'Guarantees the shortest path in terms of steps on uniform-cost grids. High memory consumption due to frontier expansion.',
      colorClass: 'bfs'
    },
    {
      name: 'Depth-First Search (DFS)',
      type: 'Uninformed / Deep Exploration',
      mechanism: 'Explores deepest reachable neighbors along a branch using a Last-In-First-Out (LIFO) stack before backtracking.',
      properties: 'Low memory footprint, but does not guarantee the shortest path. Can generate long, circuitous escape routes.',
      colorClass: 'dfs'
    },
    {
      name: 'A* Search Algorithm',
      type: 'Informed / Heuristic Search',
      mechanism: 'Evaluates nodes using f(n) = g(n) + h(n), where g(n) is the exact path cost from start and h(n) is the estimated distance to the exit.',
      properties: 'Both optimal and complete when using an admissible heuristic (e.g. Manhattan or Euclidean distance). Highly efficient.',
      colorClass: 'astar'
    },
    {
      name: 'Greedy Best-First Search',
      type: 'Informed / Greedy Heuristic',
      mechanism: 'Evaluates nodes purely using f(n) = h(n), expanding nodes closest to the exit target.',
      properties: 'Very fast in open layouts, but not optimal and prone to dead-ends when confronting complex obstacle walls or fire clusters.',
      colorClass: 'greedy'
    }
  ]

  return (
    <div className="about-view-container">
      <div className="about-hero-card">
        <div className="about-badge">Capstone Academic Project</div>
        <h2 className="about-title">Emergency Building Evacuation Planner</h2>
        <p className="about-subtitle">
          An AI-powered simulation environment designed to analyze, benchmark, and visualize emergency evacuation routes
          through multi-obstacle building topologies under dynamic hazard conditions.
        </p>
      </div>

      <div className="about-section">
        <h3 className="section-heading">Project Objectives & Scope</h3>
        <div className="about-cards-grid">
          <div className="about-card">
            <div className="card-icon" aria-hidden="true">🏢</div>
            <h4>Spatial Modeling</h4>
            <p>
              Represent complex multi-corridor architectural layouts as discrete graph networks with walls, rooms, doors, and evacuation exits.
            </p>
          </div>
          <div className="about-card">
            <div className="card-icon" aria-hidden="true">🔥</div>
            <h4>Hazard Propagation</h4>
            <p>
              Simulate dynamic environmental constraints including expanding fire boundaries, smoke accumulation, and blocked bottleneck corridors.
            </p>
          </div>
          <div className="about-card">
            <div className="card-icon" aria-hidden="true">⚡</div>
            <h4>Comparative Search</h4>
            <p>
              Directly compare classical uninformed search strategies against informed heuristic approaches on identical spatial topologies.
            </p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h3 className="section-heading">Planned AI Search Algorithms</h3>
        <div className="algo-about-grid">
          {algorithms.map((algo, index) => (
            <div key={index} className={`algo-about-card ${algo.colorClass}`}>
              <div className="algo-about-header">
                <h4>{algo.name}</h4>
                <span className="algo-type-tag">{algo.type}</span>
              </div>
              <p className="algo-mech"><strong>Mechanism:</strong> {algo.mechanism}</p>
              <p className="algo-props"><strong>Characteristics:</strong> {algo.properties}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="disclaimer-banner">
        <div className="disclaimer-icon" aria-hidden="true">⚠️</div>
        <div className="disclaimer-content">
          <h4>Academic Simulation Disclaimer</h4>
          <p>
            This software is developed strictly for academic evaluation, algorithm benchmarking, and educational demonstrations
            as part of a computer science capstone project. It is <strong>not</strong> certified for real-world life safety,
            fire marshal compliance, architectural egress validation, or active municipal emergency dispatch.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutView
