# Emergency Building Evacuation Planner (EvacPlanner)

**EvacPlanner** is an interactive, browser-based Artificial Intelligence simulation and decision-support tool developed as a Computer Science Capstone Project. It models multi-corridor architectural layouts as discrete spatial grids and calculates safe, hazard-aware evacuation pathways from evacuee origins to emergency exits using classical and heuristic AI graph-search algorithms.

---

## 1. Problem Statement & Objectives

During emergency scenarios such as structural fires or building collapses, rapid and safe evacuation is critical to life safety. Traditional egress strategies rely on static exit signs that fail to account for dynamic hazards, blocked corridors, or corridor congestion.

### Project Objectives
- **Spatial Topology Modeling:** Represent discrete floor plans as uniform 2D grid graphs with barriers, evacuee origins, hazards, and emergency exits.
- **Dynamic Constraint Handling:** Enforce strict four-directional (orthogonal) non-diagonal traversal rules that treat structural walls, blocked passages, and fire hazards as strictly impassable.
- **Algorithm Implementation & Benchmarking:** Implement and compare classical uninformed search strategies (**Breadth-First Search**, **Depth-First Search**) and informed heuristic search strategies (**A\* Search**, **Greedy Best-First Search**).
- **Step-by-Step Traversal Animation:** Provide an interactive playback engine with forward stepping, variable playback speed, dynamic hazard injection, and real-time visualization of explored frontiers versus chosen routes.
- **Session Telemetry & Audit Logs:** Maintain a persistent, zero-database session history recording every execution across the Dashboard, Evacuation Simulation Engine, and Comparison Benchmarks.
- **Zero-Backend Client-Side Architecture:** Deliver a lightweight, reproducible Single-Page Application (SPA) requiring zero paid APIs, databases, or cloud infrastructure.

---

## 2. Technologies Used

- **Frontend Framework:** React 19 (Hooks: `useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`)
- **Build Tool:** Vite 8 (Ultra-fast HMR and optimized production bundling)
- **Styling:** Vanilla CSS3 (Custom design tokens, dark navy emergency operations theme, responsive layouts)
- **Linting & Code Quality:** Oxlint (High-performance linter)
- **Session Storage:** Native Browser `sessionStorage` with graceful fallback to React state
- **Testing & Verification:** Custom automated Node.js test harnesses simulating grid dynamics and algorithm edge cases

---

## 3. Main Features & User Workflow

1. **Operations Dashboard (`Dashboard`):**
   - Real-time summary cards displaying active facility configurations, verified exits, hazard count, and recent simulation performance.
   - Interactive evacuation preview map showing real-time path traversal and frontier expansion.
   - Algorithm selection controls with specs, evaluation functions, and live simulation execution.
   - Session activity stream tracking recent runs.

2. **Building Floor Plan Editor (`Building Map`):**
   - 14 × 10 interactive discrete grid canvas with coordinate indexing (`R1-R10`, `C1-C14`).
   - Drag-painting brush tools: **Empty Corridor**, **Structural Wall**, **Evacuee Start**, **Emergency Exit**, **Fire Hazard**, and **Blocked Corridor**.
   - Preset loader for canonical blueprints (*Engineering Complex Block A*, *Science Laboratory Hall*, *Open Office Layout*).
   - Real-time grid validation (detects missing start, missing exit, and out-of-bounds cells).

3. **Dedicated Evacuation Simulation Engine (`Evacuation Simulation`):**
   - Direct execution of BFS, A*, DFS, and Greedy Best-First Search on the active building layout.
   - Full playback controls: **Play / Pause**, **Step Forward**, **Reset**, **Full Route**, and **Speed Controls** (0.5x, 1x, 2x, 3x).
   - Visual frontier expansion distinguishing explored/visited nodes, active frontier head, safe evacuation route, and moving evacuee indicator (`🏃`).
   - **Simulate Dynamic Fire:** Safely introduces a simulated fire hazard along the remaining path and executes dynamic route re-calculation avoiding newly blocked corridors or reporting safe failure if egress is severed.

4. **Simulation History & Session Logs (`Simulation History`):**
   - Centralized execution audit trail recording simulations from Dashboard and Simulation Engine.
   - Tracks unique run ID, timestamp, algorithm, building preset, route length, nodes explored, compute duration, targeted exit coordinates, and layout snapshot.
   - Filtering by algorithm (All, BFS, A*, DFS, Greedy) and status (All, Safe Route, No Safe Route).
   - Single-click **Re-run** to restore the recorded layout snapshot and re-execute.
   - **Clear History** action with confirmation dialog.
   - Automatically persisted to browser `sessionStorage` across page reloads.

5. **About Page (`About Project`):**
   - Academic background, theoretical objectives, and vital safety disclaimers.

---

## 4. Grid Representation & Movement Rules

- **Grid Dimensions:** 14 columns × 10 rows (140 discrete cells).
- **Coordinate System:** 0-indexed matrix internally `[row, col]`; rendered as 1-indexed `[R1-R10, C1-C14]` in the UI.
- **Cell Types:**
  - `START` (`S`): Evacuee initial position (exactly 1 allowed).
  - `EXIT` (`E`): Designated emergency exit door (at least 1 required; multiple supported).
  - `EMPTY` (`.`): Walkable corridor floor (traversable, cost = 1 move).
  - `WALL` (`W`): Structural concrete wall (strictly impassable).
  - `FIRE` (`F`): Active fire hazard (strictly impassable on safe routes).
  - `BLOCKED` (`B`): Collapsed or locked corridor (strictly impassable).
- **Movement Constraints:**
  - **4-Directional Orthogonal Movement:** Only UP `[-1, 0]`, RIGHT `[0, +1]`, DOWN `[+1, 0]`, and LEFT `[0, -1]` transitions are permitted.
  - **No Diagonal Movement:** Diagonal transitions are strictly rejected.
  - **Uniform Cost:** Every orthogonal move across a walkable cell costs exactly 1 unit.

---

## 5. Search Algorithms & Theoretical Comparison

| Algorithm | Category | Internal Data Structure | Heuristic Function | Shortest Path Guarantee? | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Breadth-First Search (BFS)** | Uninformed | Queue (FIFO) | None (uniform expansion) | **Yes** (Guaranteed on uniform grids) | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ |
| **Depth-First Search (DFS)** | Uninformed | Stack (LIFO) | None (deep expansion) | **No** (Frequently long & circuitous) | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ |
| **A\* Search** | Informed | Priority Queue (Min-Heap) | $f(n) = g(n) + h(n)$ | **Yes** (With admissible heuristic) | $\mathcal{O}(E \log V)$ | $\mathcal{O}(V)$ |
| **Greedy Best-First Search** | Informed | Priority Queue (Min-Heap) | $f(n) = h(n)$ | **No** (Prone to local obstacles) | $\mathcal{O}(E \log V)$ | $\mathcal{O}(V)$ |

### In-Depth Algorithm Explanations (Viva Reference)

1. **Breadth-First Search (BFS):**
   - **How it works:** Explores the graph layer by layer using a FIFO queue. It visits all immediate neighbors (distance 1) before exploring neighbors' neighbors (distance 2).
   - **Shortest Path Guarantee:** Because edge weights are uniform (1 step each), BFS discovers nodes in ascending order of their path distance from the start. The first time an exit is reached, that path is guaranteed to have the minimum possible number of moves.
   - **Trade-off:** High memory usage because the frontier stores entire concentric rings of nodes.

2. **Depth-First Search (DFS):**
   - **How it works:** Explores as deeply as possible along a single branch using a LIFO stack before backtracking when hitting dead ends.
   - **Shortest Path Guarantee:** **None.** DFS grabs the first viable branch and follows it until an exit is found. This often leads through winding corridors far away from the nearest exit.
   - **Trade-off:** Very low memory footprint, but poor path quality in open layouts.

3. **A\* Search Algorithm:**
   - **How it works:** Evaluates nodes using $f(n) = g(n) + h(n)$, where $g(n)$ is the exact cost from start to node $n$, and $h(n)$ is the estimated cost from $n$ to the nearest exit.
   - **Heuristic Choice:** Uses **Manhattan Distance**: $h(n) = \min_{\text{exit}} (|row_n - row_e| + |col_n - col_e|)$. In a 4-directional grid, Manhattan distance never overestimates the true remaining moves (it is **admissible** and **consistent**).
   - **Shortest Path Guarantee:** **Yes.** With an admissible heuristic, A\* is mathematically guaranteed to find an optimal shortest path while pruning large swaths of the search space that BFS would redundantly explore.

4. **Greedy Best-First Search:**
   - **How it works:** Prioritizes nodes strictly by $f(n) = h(n)$ (closest straight-line Manhattan distance to the goal), completely ignoring accumulated path cost $g(n)$.
   - **Shortest Path Guarantee:** **No.** While fast in open spaces, Greedy is susceptible to being lured toward an exit right into a wall or fire pocket, forcing detours and yielding suboptimal paths.

---

## 6. Project Architecture & Directory Structure

```
├── public/                 # Static assets
├── src/
│   ├── algorithms/         # Pure algorithmic pathfinding engines
│   │   ├── astar.js        # A* Search implementation (Min-Heap, Manhattan heuristic)
│   │   ├── bfs.js          # Breadth-First Search implementation (FIFO Queue)
│   │   ├── dfs.js          # Depth-First Search implementation (LIFO Stack)
│   │   ├── greedy.js       # Greedy Best-First Search implementation (Min-Heap by h)
│   │   └── index.js        # Universal algorithm dispatcher
│   ├── assets/             # Brand logos and iconography
│   ├── components/         # React presentation and container components
│   │   ├── AboutView.jsx                # Capstone documentation and disclaimer view
│   │   ├── AlgorithmSelector.jsx        # Algorithm choosing panel & run trigger
│   │   ├── BuildingMapView.jsx          # Interactive 14x10 grid floor plan editor
│   │   ├── ComparisonView.jsx           # Multi-algorithm benchmark table & cards
│   │   ├── DashboardView.jsx            # Operations dashboard master container
│   │   ├── EvacuationSimulationView.jsx # Dedicated simulation engine with playback & dynamic fire
│   │   ├── Header.jsx                   # Responsive header and building preset selector
│   │   ├── MapPreview.jsx               # Animation preview engine for dashboard
│   │   ├── PlaceholderView.jsx          # Fallback view for unmounted stages
│   │   ├── RecentActivity.jsx           # Dashboard recent run stream
│   │   ├── ResultsPanel.jsx             # Detailed metrics readout (moves, time, exit)
│   │   ├── Sidebar.jsx                  # Collapsible navigation drawer
│   │   ├── SimulationHistoryView.jsx    # Session telemetry, filters, and rerun capability
│   │   └── SummaryCards.jsx             # Live stat cards (Exits, Hazards, Last Sim)
│   ├── constants/
│   │   └── gridConstants.js        # Grid dimensions (14x10), cell types, and presets
│   ├── utils/
│   │   ├── algorithmsVerification.js        # Verification suite for DFS, A*, and Greedy
│   │   ├── bfsVerification.js               # Verification suite for BFS
│   │   ├── gridMovementVerification.js      # Movement rules and grid boundary tests
│   │   ├── gridUtils.js                     # Coordinate math, neighbor discovery, grid cloning
│   │   └── simulationHistoryVerification.js # Simulation engine & session history verification
│   ├── App.css             # Component styling and layout stylesheets
│   ├── App.jsx             # Root state container, routing, and simulation handler
│   ├── index.css           # Global CSS variables, reset, and theme tokens
│   └── main.jsx            # React 19 application entry point
├── .oxlintrc.json          # Oxlint configuration
├── package.json            # NPM scripts and dependencies
├── vite.config.js          # Vite configuration
└── README.md               # College Project Documentation
```

---

## 7. Installation & Execution Guide

### Prerequisites
- **Node.js:** v18.0.0 or later (Node v20+ recommended)
- **NPM:** v9.0.0 or later

### Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### Running the Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Building for Production
Generate the optimized production distribution build in `dist/`:
```bash
npm run build
```

### Running the Linter
Ensure code style and standard compliance:
```bash
npm run lint
```

---

## 8. Verification & Automated Test Suites

All tests are implemented using native Node.js ESM scripts and test real algorithm implementations without mocking.

| NPM Command | Target Script | Test Scope | Result |
| :--- | :--- | :--- | :--- |
| `npm run test:movement` | `src/utils/gridMovementVerification.js` | Grid boundaries, cell traversability, 4-directional moves, obstacle blocking, preset validity | **42 / 42 PASSED** |
| `npm run test:bfs` | `src/utils/bfsVerification.js` | BFS shortest-path guarantee, hazard avoidance, multi-exit nearest selection, trapped start handling | **28 / 28 PASSED** |
| `npm run test:algorithms` | `src/utils/algorithmsVerification.js` | DFS, A\*, Greedy implementations, optimality matching (A\* == BFS), edge case resilience | **44 / 44 PASSED** |
| `npm run test:simulation` | `src/utils/simulationHistoryVerification.js` | Simulation traces, step bounds, dynamic hazard rerouting, central history flow, rerun snapshot isolation | **43 / 43 PASSED** |
| `npm run lint` | Oxlint | Static code analysis on 27 source files | **0 errors, 0 warnings** |
| `npm run build` | Vite build | Client production bundle verification | **Clean build (0 errors)** |

---

## 9. Limitations & Realistic Future Work

### Current Academic Limitations
- **Discrete 2D Grid:** Models space as flat 14 × 10 cells without modeling multi-story stairwells, ramps, or vertical elevation.
- **Single Evacuee Origin:** Focuses on single-agent pathfinding from one start coordinate rather than modeling crowd stampedes or corridor flow rates.
- **Simulated Hazard Outbreaks:** Dynamic fire spread is triggered via simulated discrete corridor ignition rather than complex thermodynamic Navier-Stokes equations.
- **Session Memory:** History is maintained in `sessionStorage` per browser tab rather than persistent cloud database sync across devices.

### Future Enhancements
- **Multi-Agent Collision Avoidance:** Extend search with Conflict-Based Search (CBS) or Time-Space A\* to model dozens of evacuees competing for door bottlenecks.
- **Dynamic Fire Spread Model:** Implement cellular automata (e.g., Rothermel surface fire spread) to dynamically ignite neighboring cells over animation ticks.
- **3D Multi-Floor Building Graphs:** Connect multiple floor plans using stairwell and elevator nodes for vertical egress analysis.
- **Export Capabilities:** Download benchmark comparison sheets and session logs as CSV or PDF report summaries for municipal fire safety audits.
