/**
 * Automated Verification Utility for Stage 5: BFS Pathfinding Algorithm
 * Emergency Building Evacuation Planner (EvacPlanner)
 *
 * Verifies:
 * 1. Reachable exit produces a safe shortest route.
 * 2. Multiple exits: shortest reachable exit is chosen.
 * 3. Impassable obstacles (Walls, Blocked, Fire) are never included in the path.
 * 4. Trapped grid reports failure gracefully without crashing.
 * 5. Missing Start or Exit reports INVALID_GRID without crashing.
 * 6. Start directly adjacent to Exit returns 1 move.
 * 7. Path contains Start at index 0 and Exit at index -1.
 * 8. pathLength strictly equals path.length - 1.
 * 9. Grid is not mutated by the algorithm.
 * 10. Execution works across all pre-configured building blueprints.
 */

import {
  CELL_TYPES,
  PRESET_ENGINEERING_BLOCK_A,
  PRESET_SCIENCE_LAB,
  PRESET_OPEN_OFFICE
} from '../constants/gridConstants.js'

import { runBFS } from '../algorithms/bfs.js'
import { cloneGrid, createEmptyGrid } from './gridUtils.js'

let totalTests = 0
let passedTests = 0
let failedTests = 0

function assert(description, condition, details = '') {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  [PASS] ${description}`)
  } else {
    failedTests++
    console.error(`  [FAIL] ${description} ${details ? `-> ${details}` : ''}`)
  }
}

export function runBFSVerification() {
  console.log('\n=============================================================')
  console.log(' STAGE 5: BFS PATHFINDING ALGORITHM VERIFICATION SUITE')
  console.log('=============================================================\n')

  const W = CELL_TYPES.WALL
  const E = CELL_TYPES.EMPTY
  const S = CELL_TYPES.START
  const X = CELL_TYPES.EXIT
  const F = CELL_TYPES.FIRE
  const B = CELL_TYPES.BLOCKED

  // Test Grid 1: Basic Grid with obstacles
  // Row 0: W, W, W, X, W
  // Row 1: W, E, E, E, W
  // Row 2: W, E, W, F, W
  // Row 3: W, S, B, E, W
  // Row 4: W, W, W, W, W
  const grid1 = [
    [W, W, W, X, W],
    [W, E, E, E, W],
    [W, E, W, F, W],
    [W, S, B, E, W],
    [W, W, W, W, W]
  ]

  // Test Group 1: Basic BFS Path Execution
  console.log('1. Testing Basic Shortest Path Finding:')
  const grid1Clone = cloneGrid(grid1)
  const result1 = runBFS(grid1)

  assert('BFS returns success=true for reachable exit', result1.success === true)
  assert('BFS status is SUCCESS', result1.status === 'SUCCESS')
  assert('Path starts at Start [R4, C2]', result1.path[0].row === 3 && result1.path[0].col === 1)
  assert('Path ends at Exit [R1, C4]', result1.path[result1.path.length - 1].row === 0 && result1.path[result1.path.length - 1].col === 3)
  assert('Path length in moves equals path.length - 1', result1.pathLength === result1.path.length - 1)
  assert('Correct optimal shortest move count (5 moves)', result1.pathLength === 5)
  assert('Explored nodes count is positive and tracked', result1.exploredCount > 0 && result1.explored.length === result1.exploredCount)
  assert('Execution time is recorded and > 0 ms', result1.executionTimeMs > 0)

  // Verify non-destructive invariant
  const gridUnchanged = JSON.stringify(grid1) === JSON.stringify(grid1Clone)
  assert('BFS does not mutate the input grid matrix', gridUnchanged)

  // Test Group 2: Obstacle Avoidance
  console.log('\n2. Testing Strict Obstacle & Hazard Avoidance:')
  const pathContainsWall = result1.path.some((p) => grid1[p.row][p.col] === W)
  const pathContainsFire = result1.path.some((p) => grid1[p.row][p.col] === F)
  const pathContainsBlocked = result1.path.some((p) => grid1[p.row][p.col] === B)

  assert('Path never traverses any structural Wall (W)', !pathContainsWall)
  assert('Path never traverses any active Fire Hazard (F)', !pathContainsFire)
  assert('Path never traverses any Blocked Obstacle (B)', !pathContainsBlocked)

  // Test Group 3: Multiple Exits & Nearest Exit Selection
  console.log('\n3. Testing Multiple Exits (Nearest Selection):')
  // Row 0: W, X1, W, W, X2, W
  // Row 1: W, E,  E, E,  E, W
  // Row 2: W, S,  E, E,  E, W
  // Row 3: W, W,  W, W,  W, W
  // Exit 1 at [0, 1] is distance 2 from Start [2, 1] (via [1, 1])
  // Exit 2 at [0, 4] is distance 5 from Start [2, 1]
  const multiExitGrid = [
    [W, X, W, W, X, W],
    [W, E, E, E, E, W],
    [W, S, E, E, E, W],
    [W, W, W, W, W, W]
  ]
  const multiResult = runBFS(multiExitGrid)
  assert('Selects the nearest emergency exit ([0, 1] at 2 moves)', multiResult.selectedExit.row === 0 && multiResult.selectedExit.col === 1)
  assert('Path length to nearest exit is exactly 2 moves', multiResult.pathLength === 2)

  // Test Group 4: Start Directly Adjacent to Exit
  console.log('\n4. Testing Edge Case: Start Adjacent to Exit:')
  const adjacentGrid = [
    [W, X, W],
    [W, S, W],
    [W, W, W]
  ]
  const adjResult = runBFS(adjacentGrid)
  assert('Adjacent Start to Exit succeeds in 1 move', adjResult.success === true && adjResult.pathLength === 1)
  assert('Adjacent path has exactly 2 cells [Start, Exit]', adjResult.path.length === 2)

  // Test Group 5: Trapped / No Safe Route Available
  console.log('\n5. Testing Trapped Evacuee (No Safe Route):')
  // Start surrounded by walls/fires
  const trappedGrid = [
    [W, X, W, W],
    [W, E, W, W],
    [W, W, F, W],
    [W, S, W, W],
    [W, W, W, W]
  ]
  const trappedResult = runBFS(trappedGrid)
  assert('Returns success=false when completely blocked', trappedResult.success === false)
  assert('Returns status=NO_ROUTE', trappedResult.status === 'NO_ROUTE')
  assert('Returns empty path on failure', trappedResult.path.length === 0)
  assert('Explains failure in message', trappedResult.message.includes('No safe evacuation route'))

  // Test Group 6: Missing Start or Missing Exit Validation
  console.log('\n6. Testing Input Validation Error Handling:')
  const noStartGrid = createEmptyGrid()
  noStartGrid[8][1] = E // clear start
  const noStartRes = runBFS(noStartGrid)
  assert('Missing Start reports success=false and INVALID_GRID', noStartRes.success === false && noStartRes.status === 'INVALID_GRID')

  const noExitGrid = createEmptyGrid()
  noExitGrid[0][7] = W // clear exit
  const noExitRes = runBFS(noExitGrid)
  assert('Missing Exit reports success=false and INVALID_GRID', noExitRes.success === false && noExitRes.status === 'INVALID_GRID')

  // Test Group 7: Blueprint Verification
  console.log('\n7. Testing BFS on Canonical Building Blueprints:')
  const bldgARes = runBFS(PRESET_ENGINEERING_BLOCK_A)
  assert('BFS succeeds on Engineering Complex Block A', bldgARes.success === true)
  assert('Block A finds a safe path (moves > 0)', bldgARes.pathLength > 0)
  assert('Block A avoids the active fire cluster', !bldgARes.path.some((p) => PRESET_ENGINEERING_BLOCK_A[p.row][p.col] === F))

  const sciLabRes = runBFS(PRESET_SCIENCE_LAB)
  assert('BFS succeeds on Science Laboratory Hall', sciLabRes.success === true)
  assert('Science Lab avoids locked cleanrooms & chemical fires', !sciLabRes.path.some((p) => PRESET_SCIENCE_LAB[p.row][p.col] === F || PRESET_SCIENCE_LAB[p.row][p.col] === B))

  const officeRes = runBFS(PRESET_OPEN_OFFICE)
  assert('BFS succeeds on Open Office Layout', officeRes.success === true)

  console.log('\n-------------------------------------------------------------')
  console.log(` BFS VERIFICATION SUMMARY: ${passedTests} / ${totalTests} tests passed.`)
  if (failedTests > 0) {
    console.error(` FAILURE: ${failedTests} test(s) failed!`)
    return false
  } else {
    console.log(' ALL BFS PATHFINDING TESTS PASSED!')
    console.log('-------------------------------------------------------------\n')
    return true
  }
}

// Automatically execute if run directly via Node.js
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('bfsVerification.js')) {
  const success = runBFSVerification()
  process.exit(success ? 0 : 1)
}
