/**
 * Automated Verification Utility for Stage 4: Grid Data Model and Movement Rules
 * Emergency Building Evacuation Planner (EvacPlanner)
 *
 * Runs self-contained assertions for:
 * 1. 4-directional orthogonal movement (Up, Right, Down, Left)
 * 2. Traversability rules (Walkable, Start, Exit vs. Wall, Blocked, Fire)
 * 3. Diagonal movement rejection
 * 4. Boundary checking (out of bounds rejection)
 * 5. Deterministic neighbor ordering (UP, RIGHT, DOWN, LEFT)
 * 6. Start and Exit discovery across canonical blueprints
 * 7. Pathfinding readiness validation
 */

import {
  CELL_TYPES,
  PRESET_ENGINEERING_BLOCK_A,
  PRESET_SCIENCE_LAB,
  PRESET_OPEN_OFFICE,
  PRESETS
} from '../constants/gridConstants.js'

import {
  isInsideGrid,
  getCellType,
  isCellTraversable,
  canMoveBetween,
  canMoveBetweenWithReason,
  getValidNeighbors,
  findStartCell,
  findAllExitCells,
  validateGrid,
  createEmptyGrid
} from './gridUtils.js'

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

export function runMovementVerification() {
  console.log('\n=============================================================')
  console.log(' STAGE 4: GRID DATA MODEL & MOVEMENT RULES VERIFICATION SUITE')
  console.log('=============================================================\n')

  // Create a controlled 5x5 test grid
  // Row 0: W, X, W, W, W
  // Row 1: W, E, E, E, W
  // Row 2: W, E, W, F, W
  // Row 3: W, S, B, E, W
  // Row 4: W, W, W, W, W
  const testGrid = [
    [CELL_TYPES.WALL, CELL_TYPES.EXIT,  CELL_TYPES.WALL,  CELL_TYPES.WALL,  CELL_TYPES.WALL],
    [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
    [CELL_TYPES.WALL, CELL_TYPES.EMPTY, CELL_TYPES.WALL,  CELL_TYPES.FIRE,  CELL_TYPES.WALL],
    [CELL_TYPES.WALL, CELL_TYPES.START, CELL_TYPES.BLOCKED, CELL_TYPES.EMPTY, CELL_TYPES.WALL],
    [CELL_TYPES.WALL, CELL_TYPES.WALL,  CELL_TYPES.WALL,  CELL_TYPES.WALL,  CELL_TYPES.WALL]
  ]

  // Test Group 1: Traversability Rules & Boundary Utilities
  console.log('1. Testing Cell Traversability and Boundary Utilities:')
  assert('isInsideGrid accurately identifies coordinate within boundaries', isInsideGrid(testGrid, 0, 0) === true)
  assert('isInsideGrid rejects negative row coordinate', isInsideGrid(testGrid, -1, 2) === false)
  assert('isInsideGrid rejects out-of-bounds row coordinate', isInsideGrid(testGrid, 5, 2) === false)
  assert('getCellType returns correct cell type at valid coordinate', getCellType(testGrid, 0, 1) === CELL_TYPES.EXIT)
  assert('getCellType returns null for out-of-bounds coordinate', getCellType(testGrid, -1, 0) === null)
  assert('Walkable corridor (EMPTY) is traversable', isCellTraversable(testGrid, 1, 1) === true)
  assert('Start location (START) is traversable', isCellTraversable(testGrid, 3, 1) === true)
  assert('Emergency Exit (EXIT) is traversable', isCellTraversable(testGrid, 0, 1) === true)
  assert('Structural Wall (WALL) cannot be entered', isCellTraversable(testGrid, 2, 2) === false)
  assert('Blocked Obstacle (BLOCKED) cannot be entered', isCellTraversable(testGrid, 3, 2) === false)
  assert('Fire Hazard (FIRE) cannot be entered on safe routes', isCellTraversable(testGrid, 2, 3) === false)
  assert('canMoveBetweenWithReason provides diagnostic explanation for Wall rejection', canMoveBetweenWithReason(testGrid, 1, 1, 2, 1).allowed === true && canMoveBetweenWithReason(testGrid, 1, 1, 2, 2).allowed === false)

  // Test Group 2: Orthogonal Movement Permitted Cases
  console.log('\n2. Testing Orthogonal Movement Between Adjacent Cells:')
  assert(
    'Moving from Walkable [R2, C2] to adjacent Walkable [R2, C3] is allowed',
    canMoveBetween(testGrid, 1, 1, 1, 2) === true
  )
  assert(
    'Moving from Walkable [R2, C2] to Emergency Exit [R1, C2] is allowed',
    canMoveBetween(testGrid, 1, 1, 0, 1) === true
  )
  assert(
    'Moving from Walkable [R2, C2] to Start cell [R4, C2] is allowed (adjacent step)',
    canMoveBetween(testGrid, 2, 1, 3, 1) === true
  )

  // Test Group 3: Obstacle & Hazard Rejection
  console.log('\n3. Testing Obstacle and Hazard Collision Rejection:')
  assert(
    'Moving into a structural Wall is rejected',
    canMoveBetween(testGrid, 1, 2, 2, 2) === false
  )
  assert(
    'Moving into a Blocked Obstacle is rejected',
    canMoveBetween(testGrid, 3, 1, 3, 2) === false
  )
  assert(
    'Moving into an active Fire Hazard is rejected',
    canMoveBetween(testGrid, 1, 3, 2, 3) === false
  )

  // Test Group 4: Boundary & Non-Orthogonal Checks
  console.log('\n4. Testing Boundary and Geometric Constraints:')
  assert(
    'Moving beyond top grid boundary (row -1) is rejected',
    canMoveBetween(testGrid, 0, 1, -1, 1) === false
  )
  assert(
    'Moving beyond bottom grid boundary (row 5) is rejected',
    canMoveBetween(testGrid, 4, 1, 5, 1) === false
  )
  assert(
    'Moving beyond left grid boundary (col -1) is rejected',
    canMoveBetween(testGrid, 1, 0, 1, -1) === false
  )
  assert(
    'Moving beyond right grid boundary (col 5) is rejected',
    canMoveBetween(testGrid, 1, 4, 1, 5) === false
  )
  assert(
    'Diagonal movement [R2, C2] -> [R3, C3] is strictly rejected',
    canMoveBetween(testGrid, 1, 1, 2, 2) === false
  )
  assert(
    'Zero-distance step (staying in same cell) is rejected',
    canMoveBetween(testGrid, 1, 1, 1, 1) === false
  )
  assert(
    'Two-step jump [R2, C2] -> [R2, C4] is rejected',
    canMoveBetween(testGrid, 1, 1, 1, 3) === false
  )

  // Test Group 5: Deterministic Neighbor Ordering (UP, RIGHT, DOWN, LEFT)
  console.log('\n5. Testing Deterministic Neighbor Ordering (UP, RIGHT, DOWN, LEFT):')
  // Cell [1, 2]:
  // UP [0, 2] -> WALL (filtered out)
  // RIGHT [1, 3] -> EMPTY (valid)
  // DOWN [2, 2] -> WALL (filtered out)
  // LEFT [1, 1] -> EMPTY (valid)
  const neighbors = getValidNeighbors(testGrid, 1, 2)
  assert('Returns exactly 2 valid traversable neighbors for cell [1, 2]', neighbors.length === 2)
  assert('First neighbor is RIGHT [1, 3]', neighbors[0].direction === 'RIGHT' && neighbors[0].row === 1 && neighbors[0].col === 3)
  assert('Second neighbor is LEFT [1, 1]', neighbors[1].direction === 'LEFT' && neighbors[1].row === 1 && neighbors[1].col === 1)

  // Test Group 6: Start and Exit Detection on Canonical Blueprints
  console.log('\n6. Testing Blueprint Start & Exit Discovery:')
  const bldgA = PRESET_ENGINEERING_BLOCK_A
  const bldgAStart = findStartCell(bldgA)
  const bldgAExits = findAllExitCells(bldgA)
  assert('Finds Start cell in Engineering Block A at [R8, C2]', bldgAStart?.row === 7 && bldgAStart?.col === 1)
  assert('Finds all 3 Emergency Exits in Engineering Block A', bldgAExits.length === 3)

  const sciLab = PRESET_SCIENCE_LAB
  const sciLabStart = findStartCell(sciLab)
  const sciLabExits = findAllExitCells(sciLab)
  assert('Finds Start cell in Science Lab at [R8, C2]', sciLabStart?.row === 7 && sciLabStart?.col === 1)
  assert('Finds all 4 Emergency Exits in Science Lab', sciLabExits.length === 4)

  const openOffice = PRESET_OPEN_OFFICE
  const openOfficeStart = findStartCell(openOffice)
  const openOfficeExits = findAllExitCells(openOffice)
  assert('Finds Start cell in Open Office at [R8, C2]', openOfficeStart?.row === 7 && openOfficeStart?.col === 1)
  assert('Finds all 3 Emergency Exits in Open Office', openOfficeExits.length === 3)
  assert('All registered PRESETS (3) have valid 10x14 layouts', PRESETS.length === 3 && PRESETS.every((p) => p.layout.length === 10 && p.layout[0].length === 14))

  // Test Group 7: Pathfinding Readiness Validation
  console.log('\n7. Testing Pathfinding Readiness Validation:')
  const validResult = validateGrid(bldgA)
  assert('Engineering Block A passes validation (isValid === true)', validResult.isValid === true)
  assert('Engineering Block A is ready for algorithms (algorithmReady === true)', validResult.algorithmReady === true)
  assert('No validation errors on default blueprint', validResult.errors.length === 0)

  // Test missing start
  const noStartGrid = createEmptyGrid()
  noStartGrid[8][1] = CELL_TYPES.EMPTY // clear start
  const noStartResult = validateGrid(noStartGrid)
  assert('Grid with no Start fails algorithm readiness', noStartResult.algorithmReady === false)
  assert('Error message explicitly identifies missing Start', noStartResult.errors.some((e) => e.includes('Start')))

  // Test missing exit
  const noExitGrid = createEmptyGrid()
  noExitGrid[0][7] = CELL_TYPES.WALL // clear exit
  const noExitResult = validateGrid(noExitGrid)
  assert('Grid with no Exit fails algorithm readiness', noExitResult.algorithmReady === false)
  assert('Error message explicitly identifies missing Exit', noExitResult.errors.some((e) => e.includes('Exit')))

  console.log('\n-------------------------------------------------------------')
  console.log(` VERIFICATION SUMMARY: ${passedTests} / ${totalTests} tests passed.`)
  if (failedTests > 0) {
    console.error(` FAILURE: ${failedTests} test(s) failed!`)
    return false
  } else {
    console.log(' ALL STAGE 4 MOVEMENT RULES & DATA MODEL TESTS PASSED!')
    console.log('-------------------------------------------------------------\n')
    return true
  }
}

// Automatically execute if run directly via Node.js
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.endsWith('gridMovementVerification.js')) {
  const success = runMovementVerification()
  process.exit(success ? 0 : 1)
}
