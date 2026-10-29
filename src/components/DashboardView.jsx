import SummaryCards from './SummaryCards'
import MapPreview from './MapPreview'
import AlgorithmSelector from './AlgorithmSelector'
import ResultsPanel from './ResultsPanel'
import RecentActivity from './RecentActivity'

function DashboardView({
  selectedAlgorithm,
  setSelectedAlgorithm,
  grid,
  setActivePage,
  simulationResult,
  onRunSimulation,
  recentRuns,
  gridValidation
}) {
  return (
    <div className="dashboard-view-content">
      {/* 1. Summary Cards Row */}
      <SummaryCards grid={grid} simulationResult={simulationResult} />

      {/* 2. Main Workspace Split: Map Preview (Primary) & Controls/Results (Secondary) */}
      <div className="workspace-layout-grid">
        <div className="workspace-main-column">
          <MapPreview
            grid={grid}
            setActivePage={setActivePage}
            simulationResult={simulationResult}
          />
        </div>

        <div className="workspace-side-column">
          <AlgorithmSelector
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            onRunSimulation={onRunSimulation}
            gridValidation={gridValidation}
            simulationResult={simulationResult}
          />
          <ResultsPanel
            simulationResult={simulationResult}
            selectedAlgorithm={selectedAlgorithm}
          />
        </div>
      </div>

      {/* 3. Session Activity Section */}
      <RecentActivity recentRuns={recentRuns} />
    </div>
  )
}

export default DashboardView
