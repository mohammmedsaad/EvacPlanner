/**
 * Stage 6: Algorithms Verification Suite
 * Verifies DFS, A*, and Greedy Best-First Search pathfinding implementations
 * alongside BFS and validates comparative optimality requirements.
 *
 * Execution: node src/utils/algorithmsVerification.js
 */

import { CELL_TYPES, PRESETS } from '../constants/gridConstants.js'
import { runBFS } from '../algorithms/bfs.js'
import { runDFS } from '../algorithms/dfs.js'
import { runAStar } from '../algorithms/astar.js'
import { runGreedy } from '../algorithms/greedy.js'
import { runAlgorithm } from '../algorithms/index.js'
import { cloneGrid } from './gridUtils.js'

let totalTests = 0
let passedTests = 0

function assert(condition, message) {
  totalTests++
  if (condition) {
    passedTests++
    console.log(`  [PASS] ${message}`)
  } else {
    console.error(`  [FAIL] ${message}`)
    process.exitCode = 1
  }
}

console.log('\n=============================================================')
console.log(' STAGE 6: DFS, A*, & GREEDY PATHFINDING VERIFICATION SUITE')
console.log('=============================================================\n')

// Test Grid 1: Standard open corridor with obstacles
// 6 rows x 6 cols
// [0,0]=W, [0,1]=E, [0,2]=W, [0,3]=W, [0,4]=W, [0,5]=W
// [1,0]=W, [1,1]=., [1,2]=., [1,3]=., [1,4]=E, [1,5]=W  (Exit at [1,4] and [0,1])
// [2,0]=W, [2,1]=W, [2,2]=W, [2,3]=., [2,4]=., [2,5]=W
// [3,0]=W, [3,1]=., [3,2]=F, [3,3]=., [3,4]=., [3,5]=W  (Fire at [3,2])
// [4,0]=W, [4,1]=S, [4,2]=., [4,3]=., [4,4]=B, [4,5]=W  (Start at [4,1], Blocked at [4,4])
// [5,0]=W, [5,1]=W, [5,2]=W, [5,3]=W, [5,4]=W, [5,5]=W
const testGrid1 = [
  [CELL_TYPES.WALL, CELL_TYPES.EXIT,  CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL,    CELL_TYPES.WALL],
  [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EXIT,   CELL_TYPES.WALL],
  [CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY,   CELL_TYPES.WALL],
  [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.FIRE,  CELL_TYPES.EMPTY, CELL_TYPES.EMPTY,   CELL_TYPES.WALL],
  [CELL_TYPES.WALL, CELL_TYPES.START, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.BLOCKED, CELL_TYPES.WALL],
  [CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL,    CELL_TYPES.WALL]
]

// -------------------------------------------------------------
// 1. Testing A* Search (ASTAR)
// -------------------------------------------------------------
console.log('1. Testing A* Search (Optimal Shortest Route):')
const astarRes = runAStar(testGrid1)
assert(astarRes.success === true, 'A* returns success=true for reachable exit')
assert(astarRes.status === 'SUCCESS', 'A* status is SUCCESS')
assert(astarRes.path.length > 0, 'A* returns non-empty path')
assert(astarRes.path[0].row === 4 && astarRes.path[0].col === 1, 'A* path starts at Start [R4, C1]')
assert(astarRes.path[astarRes.path.length - 1].row === astarRes.selectedExit.row &&
       astarRes.path[astarRes.path.length - 1].col === astarRes.selectedExit.col, 'A* path terminates at selected Exit')
assert(astarRes.pathLength === astarRes.path.length - 1, 'A* path length equals path cell count minus one')

// Compare A* against BFS: both MUST guarantee the exact same optimal shortest path length!
const bfsRes = runBFS(testGrid1)
assert(astarRes.pathLength === bfsRes.pathLength, `A* achieves same optimal move count as BFS (${astarRes.pathLength} moves)`)
assert(astarRes.exploredCount > 0, 'A* tracks explored nodes')
assert(astarRes.executionTimeMs >= 0, 'A* measures execution time')

// Verify obstacle avoidance in A*
const astarAvoidsObstacles = astarRes.path.every(pt => {
  const t = testGrid1[pt.row][pt.col]
  return t !== CELL_TYPES.WALL && t !== CELL_TYPES.FIRE && t !== CELL_TYPES.BLOCKED
})
assert(astarAvoidsObstacles, 'A* path strictly avoids Wall, Fire, and Blocked cells')

// -------------------------------------------------------------
// 2. Testing Depth-First Search (DFS)
// -------------------------------------------------------------
console.log('\n2. Testing Depth-First Search (DFS):')
const dfsRes = runDFS(testGrid1)
assert(dfsRes.success === true, 'DFS returns success=true for reachable exit')
assert(dfsRes.status === 'SUCCESS', 'DFS status is SUCCESS')
assert(dfsRes.path.length > 0, 'DFS returns non-empty path')
assert(dfsRes.path[0].row === 4 && dfsRes.path[0].col === 1, 'DFS path starts at Start [R4, C1]')
assert(dfsRes.path[dfsRes.path.length - 1].row === dfsRes.selectedExit.row &&
       dfsRes.path[dfsRes.path.length - 1].col === dfsRes.selectedExit.col, 'DFS path ends at Exit')
assert(dfsRes.pathLength === dfsRes.path.length - 1, 'DFS path length equals path cell count minus one')
const dfsAvoidsObstacles = dfsRes.path.every(pt => {
  const t = testGrid1[pt.row][pt.col]
  return t !== CELL_TYPES.WALL && t !== CELL_TYPES.FIRE && t !== CELL_TYPES.BLOCKED
})
assert(dfsAvoidsObstacles, 'DFS path strictly avoids Wall, Fire, and Blocked cells')
assert(dfsRes.exploredCount > 0, 'DFS tracks explored nodes')

// -------------------------------------------------------------
// 3. Testing Greedy Best-First Search (GREEDY)
// -------------------------------------------------------------
console.log('\n3. Testing Greedy Best-First Search (GREEDY):')
const greedyRes = runGreedy(testGrid1)
assert(greedyRes.success === true, 'Greedy returns success=true for reachable exit')
assert(greedyRes.status === 'SUCCESS', 'Greedy status is SUCCESS')
assert(greedyRes.path.length > 0, 'Greedy returns non-empty path')
assert(greedyRes.path[0].row === 4 && greedyRes.path[0].col === 1, 'Greedy path starts at Start')
assert(greedyRes.path[greedyRes.path.length - 1].row === greedyRes.selectedExit.row &&
       greedyRes.path[greedyRes.path.length - 1].col === greedyRes.selectedExit.col, 'Greedy path terminates at Exit')
assert(greedyRes.pathLength === greedyRes.path.length - 1, 'Greedy path length equals path cell count minus one')
const greedyAvoidsObstacles = greedyRes.path.every(pt => {
  const t = testGrid1[pt.row][pt.col]
  return t !== CELL_TYPES.WALL && t !== CELL_TYPES.FIRE && t !== CELL_TYPES.BLOCKED
})
assert(greedyAvoidsObstacles, 'Greedy path strictly avoids Wall, Fire, and Blocked cells')

// -------------------------------------------------------------
// 4. Testing Edge Cases (Adjacent Start/Exit & Trapped Evacuee)
// -------------------------------------------------------------
console.log('\n4. Testing Edge Cases across all algorithms:')
// Adjacent grid: 3x3 with Start at [1,1] and Exit at [1,2]
const adjGrid = [
  [CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL],
  [CELL_TYPES.WALL, CELL_TYPES.START, CELL_TYPES.EXIT],
  [CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL]
]

const adjAStar = runAStar(adjGrid)
const adjDFS = runDFS(adjGrid)
const adjGreedy = runGreedy(adjGrid)

assert(adjAStar.success && adjAStar.pathLength === 1, 'A* handles adjacent Start/Exit in 1 move')
assert(adjDFS.success && adjDFS.pathLength === 1, 'DFS handles adjacent Start/Exit in 1 move')
assert(adjGreedy.success && adjGreedy.pathLength === 1, 'Greedy handles adjacent Start/Exit in 1 move')

// Trapped Grid: Start is enclosed by walls & fire
const trappedGrid = [
  [CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL,  CELL_TYPES.EXIT],
  [CELL_TYPES.WALL, CELL_TYPES.START, CELL_TYPES.WALL,  CELL_TYPES.EMPTY],
  [CELL_TYPES.WALL, CELL_TYPES.FIRE,  CELL_TYPES.WALL,  CELL_TYPES.EMPTY],
  [CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL,  CELL_TYPES.WALL]
]

const trapAStar = runAStar(trappedGrid)
const trapDFS = runDFS(trappedGrid)
const trapGreedy = runGreedy(trappedGrid)

assert(!trapAStar.success && trapAStar.status === 'NO_ROUTE', 'A* reports NO_ROUTE when trapped')
assert(!trapDFS.success && trapDFS.status === 'NO_ROUTE', 'DFS reports NO_ROUTE when trapped')
assert(!trapGreedy.success && trapGreedy.status === 'NO_ROUTE', 'Greedy reports NO_ROUTE when trapped')

// Missing Start or Exit
const invalidGridNoExit = [
  [CELL_TYPES.WALL, CELL_TYPES.START, CELL_TYPES.WALL],
  [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.WALL]
]
assert(runAStar(invalidGridNoExit).status === 'INVALID_GRID', 'A* reports INVALID_GRID if Exit is missing')
assert(runDFS(invalidGridNoExit).status === 'INVALID_GRID', 'DFS reports INVALID_GRID if Exit is missing')
assert(runGreedy(invalidGridNoExit).status === 'INVALID_GRID', 'Greedy reports INVALID_GRID if Exit is missing')

// -------------------------------------------------------------
// 5. Testing Execution on Canonical Building Blueprints
// -------------------------------------------------------------
console.log('\n5. Testing Canonical Building Blueprints:')
for (const preset of PRESETS) {
  const g = cloneGrid(preset.layout)
  const bfs = runBFS(g)
  const dfs = runDFS(g)
  const astar = runAStar(g)
  const greedy = runGreedy(g)

  assert(bfs.success && astar.success && dfs.success && greedy.success,
    `All 4 algorithms find safe routes on "${preset.name}"`)
  assert(astar.pathLength === bfs.pathLength,
    `A* matches optimal BFS path length on "${preset.name}" (${astar.pathLength} moves)`)
}

// -------------------------------------------------------------
// 6. Testing Unified runAlgorithm Dispatcher
// -------------------------------------------------------------
console.log('\n6. Testing runAlgorithm Dispatcher:')
const sampleGrid = cloneGrid(PRESETS[0].layout)
assert(runAlgorithm('BFS', sampleGrid).algorithm === 'BFS', 'runAlgorithm("BFS") returns BFS result')
assert(runAlgorithm('DFS', sampleGrid).algorithm === 'DFS', 'runAlgorithm("DFS") returns DFS result')
assert(runAlgorithm('ASTAR', sampleGrid).algorithm === 'ASTAR', 'runAlgorithm("ASTAR") returns ASTAR result')
assert(runAlgorithm('GREEDY', sampleGrid).algorithm === 'GREEDY', 'runAlgorithm("GREEDY") returns GREEDY result')

console.log('\n-------------------------------------------------------------')
console.log(` ALGORITHMS VERIFICATION SUMMARY: ${passedTests} / ${totalTests} tests passed.`)
if (passedTests === totalTests) {
  console.log(' ALL DFS, A*, AND GREEDY ALGORITHM TESTS PASSED!')
} else {
  console.error(` ${totalTests - passedTests} TESTS FAILED!`)
  process.exitCode = 1
}
console.log('-------------------------------------------------------------\n')
