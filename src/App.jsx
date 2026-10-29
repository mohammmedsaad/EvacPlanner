import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DashboardView from './components/DashboardView'
import BuildingMapView from './components/BuildingMapView'
import EvacuationSimulationView from './components/EvacuationSimulationView'
import SimulationHistoryView from './components/SimulationHistoryView'
import AboutView from './components/AboutView'
import PlaceholderView from './components/PlaceholderView'
import { PRESETS, DEFAULT_GRID } from './constants/gridConstants'
import { cloneGrid, validateGrid } from './utils/gridUtils'
import { runAlgorithm } from './algorithms/index'

const STORAGE_KEY = 'evacplanner_simulation_history_v1'

function loadStoredHistory() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load session history from sessionStorage:', err)
  }
  return []
}

function saveStoredHistory(runs) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(runs))
    }
  } catch (err) {
    console.warn('Failed to save session history to sessionStorage:', err)
  }
}

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [selectedBuilding, setSelectedBuilding] = useState('bldg-1')
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('BFS')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [grid, setGrid] = useState(() => cloneGrid(DEFAULT_GRID))
  const [simulationResult, setSimulationResult] = useState(null)
  const [recentRuns, setRecentRuns] = useState(() => loadStoredHistory())

  // Persist recentRuns to sessionStorage on updates
  useEffect(() => {
    saveStoredHistory(recentRuns)
  }, [recentRuns])

  // Clear simulation result whenever the floor plan grid changes
  const handleSetGrid = (newGridOrUpdater) => {
    setGrid((prevGrid) => {
      const updated = typeof newGridOrUpdater === 'function' ? newGridOrUpdater(prevGrid) : newGridOrUpdater
      return updated
    })
    setSimulationResult(null)
  }

  const handleSelectBuilding = (bldgId) => {
    setSelectedBuilding(bldgId)
    const preset = PRESETS.find((p) => p.id === bldgId)
    if (preset) {
      setGrid(cloneGrid(preset.layout))
    }
    setSimulationResult(null)
  }

  // Centralized recording callback for all execution sources
  const handleRecordSimulation = useCallback(
    ({ algorithm, gridSnapshot, result, buildingName, source = 'Dashboard' }) => {
      const runLog = {
        id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        algorithm,
        buildingName: buildingName || 'Custom Floor Plan',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        success: result.success,
        pathLength: result.pathLength,
        exploredCount: result.exploredCount,
        executionTimeMs: result.executionTimeMs,
        status: result.status,
        exitCoord: result.selectedExit,
        source,
        gridSnapshot: gridSnapshot ? cloneGrid(gridSnapshot) : null
      }

      setRecentRuns((prev) => [runLog, ...prev.slice(0, 49)])
    },
    []
  )

  const handleRunSimulation = (algoId = selectedAlgorithm) => {
    const gridSnapshot = cloneGrid(grid)
    const result = runAlgorithm(algoId, gridSnapshot)
    setSimulationResult(result)

    const matchingPreset = PRESETS.find((p) => p.id === selectedBuilding)
    handleRecordSimulation({
      algorithm: algoId,
      gridSnapshot,
      result,
      buildingName: matchingPreset ? matchingPreset.name : 'Custom Floor Plan',
      source: 'Dashboard'
    })
  }

  const handleClearHistory = () => {
    setRecentRuns([])
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch (err) {
      console.warn('Failed to clear sessionStorage:', err)
    }
  }

  const handleRestoreSnapshot = (snapshot) => {
    if (snapshot) {
      setGrid(cloneGrid(snapshot))
      setSimulationResult(null)
    }
  }

  const gridValidation = validateGrid(grid)

  return (
    <div className="app-shell">
      {/* 1. Collapsible Responsive Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* 2. Main Content Area */}
      <div className="app-main-viewport">
        <Header
          activePage={activePage}
          selectedBuilding={selectedBuilding}
          setSelectedBuilding={handleSelectBuilding}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="app-content-body">
          {activePage === 'dashboard' && (
            <DashboardView
              selectedAlgorithm={selectedAlgorithm}
              setSelectedAlgorithm={setSelectedAlgorithm}
              grid={grid}
              setActivePage={setActivePage}
              simulationResult={simulationResult}
              onRunSimulation={handleRunSimulation}
              recentRuns={recentRuns}
              gridValidation={gridValidation}
            />
          )}

          {activePage === 'map' && (
            <BuildingMapView
              grid={grid}
              setGrid={handleSetGrid}
              selectedBuilding={selectedBuilding}
              setActivePage={setActivePage}
              simulationResult={simulationResult}
            />
          )}

          {activePage === 'simulation' && (
            <EvacuationSimulationView
              grid={grid}
              setGrid={handleSetGrid}
              selectedAlgorithm={selectedAlgorithm}
              setSelectedAlgorithm={setSelectedAlgorithm}
              selectedBuilding={selectedBuilding}
              onRecordSimulation={handleRecordSimulation}
              setActivePage={setActivePage}
            />
          )}

          {activePage === 'history' && (
            <SimulationHistoryView
              recentRuns={recentRuns}
              setActivePage={setActivePage}
              onRunSimulation={handleRunSimulation}
              onSelectAlgorithm={setSelectedAlgorithm}
              onClearHistory={handleClearHistory}
              onRestoreSnapshot={handleRestoreSnapshot}
            />
          )}

          {activePage === 'about' && <AboutView />}

          {activePage !== 'dashboard' &&
            activePage !== 'map' &&
            activePage !== 'simulation' &&
            activePage !== 'history' &&
            activePage !== 'about' && (
              <PlaceholderView pageId={activePage} setActivePage={setActivePage} />
            )}
        </main>
      </div>
    </div>
  )
}

export default App
