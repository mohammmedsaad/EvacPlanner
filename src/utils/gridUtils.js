/**
 * Grid Utility Functions and Movement Rules for Evacuation Planner
 * Stage 4: Grid Data Model and Movement Rules
 */

import { CELL_TYPES, GRID_DIMENSIONS, MOVEMENT_DIRECTIONS } from '../constants/gridConstants.js'

/**
 * Deep clone a 2D grid matrix
 * @param {Array<Array<string>>} grid
 * @returns {Array<Array<string>>}
 */
export function cloneGrid(grid) {
  if (!grid || !Array.isArray(grid)) return []
  return grid.map((row) => [...row])
}

/**
 * Create a new blank grid with perimeter structural walls and empty walkable corridors.
 * Places a default Start and Exit so the blank template is valid for pathfinding.
 * @param {number} [rows=GRID_DIMENSIONS.ROWS]
 * @param {number} [cols=GRID_DIMENSIONS.COLS]
 * @returns {Array<Array<string>>}
 */
export function createEmptyGrid(rows = GRID_DIMENSIONS.ROWS, cols = GRID_DIMENSIONS.COLS) {
  const grid = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        row.push(CELL_TYPES.WALL)
      } else {
        row.push(CELL_TYPES.EMPTY)
      }
    }
    grid.push(row)
  }
  // Default valid start and exit positions
  grid[rows - 2][1] = CELL_TYPES.START
  grid[0][Math.floor(cols / 2)] = CELL_TYPES.EXIT
  return grid
}

/**
 * Checks whether coordinates (row, col) are strictly inside grid boundaries.
 * @param {Array<Array<string>>} grid
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
export function isInsideGrid(grid, row, col) {
  if (!grid || !Array.isArray(grid) || grid.length === 0) return false
  const numRows = grid.length
  const numCols = grid[0]?.length || 0
  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 0 &&
    row < numRows &&
    col >= 0 &&
    col < numCols
  )
}

/**
 * Returns the cell type at (row, col) or null if out of bounds.
 * @param {Array<Array<string>>} grid
 * @param {number} row
 * @param {number} col
 * @returns {string|null}
 */
export function getCellType(grid, row, col) {
  if (!isInsideGrid(grid, row, col)) return null
  return grid[row][col]
}

/**
 * Determines whether a cell type is traversable under standard evacuation rules.
 *
 * Rules:
 * - EMPTY (Walkable): Traversable (true)
 * - START (Start location): Traversable (true)
 * - EXIT (Emergency exit): Traversable (true)
 * - WALL (Structural wall): Impassable (false)
 * - BLOCKED (Barricade/Locked): Impassable (false)
 * - FIRE (Fire Hazard): Impassable under standard safe-route rules (false, unless allowFire option is true)
 *
 * @param {string} cellType
 * @param {Object} [options]
 * @param {boolean} [options.allowFire=false] - Whether hazardous fire cells may be entered
 * @returns {boolean}
 */
export function isTypeTraversable(cellType, options = {}) {
  const { allowFire = false } = options

  switch (cellType) {
    case CELL_TYPES.EMPTY:
    case CELL_TYPES.START:
    case CELL_TYPES.EXIT:
      return true
    case CELL_TYPES.FIRE:
      return Boolean(allowFire)
    case CELL_TYPES.WALL:
    case CELL_TYPES.BLOCKED:
    default:
      return false
  }
}

/**
 * Checks whether a specific grid coordinate is inside bounds and traversable.
 * @param {Array<Array<string>>} grid
 * @param {number} row
 * @param {number} col
 * @param {Object} [options]
 * @returns {boolean}
 */
export function isCellTraversable(grid, row, col, options = {}) {
  if (!isInsideGrid(grid, row, col)) return false
  const cellType = grid[row][col]
  return isTypeTraversable(cellType, options)
}

/**
 * Determines whether movement between two cells is strictly permitted.
 *
 * Movement Rules:
 * 1. Both origin (fromRow, fromCol) and destination (toRow, toCol) must be inside grid boundaries.
 * 2. Movement must be strictly 4-directional orthogonal (Up, Right, Down, Left).
 *    Manhattan distance (|toRow - fromRow| + |toCol - fromCol|) must equal exactly 1.
 * 3. Diagonal movements (e.g. |rowDiff| === 1 && |colDiff| === 1) are strictly rejected.
 * 4. Zero distance (staying on same cell) is rejected as a movement step.
 * 5. Destination cell must be traversable (Walkable, Start, or Exit).
 *    Walls, Blocked obstacles, and Fire hazards cannot be entered.
 *
 * @param {Array<Array<string>>} grid
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {number} toRow
 * @param {number} toCol
 * @param {Object} [options]
 * @returns {boolean}
 */
export function canMoveBetween(grid, fromRow, fromCol, toRow, toCol, options = {}) {
  if (!isInsideGrid(grid, fromRow, fromCol)) return false
  if (!isInsideGrid(grid, toRow, toCol)) return false

  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  // Must be adjacent in 4-directional orthogonal grid (Manhattan distance === 1)
  if (rowDiff + colDiff !== 1) {
    return false
  }

  // Target cell must be traversable
  return isCellTraversable(grid, toRow, toCol, options)
}

/**
 * Diagnostic helper that checks movement and returns a human-readable explanation.
 * Useful for debugging, testing, and college viva explanations.
 * @param {Array<Array<string>>} grid
 * @param {number} fromRow
 * @param {number} fromCol
 * @param {number} toRow
 * @param {number} toCol
 * @param {Object} [options]
 * @returns {{ allowed: boolean, reason: string }}
 */
export function canMoveBetweenWithReason(grid, fromRow, fromCol, toRow, toCol, options = {}) {
  if (!isInsideGrid(grid, fromRow, fromCol)) {
    return { allowed: false, reason: `Origin [R${fromRow + 1}, C${fromCol + 1}] is out of grid boundaries.` }
  }
  if (!isInsideGrid(grid, toRow, toCol)) {
    return { allowed: false, reason: `Destination [R${toRow + 1}, C${toCol + 1}] is out of grid boundaries.` }
  }

  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  if (rowDiff === 0 && colDiff === 0) {
    return { allowed: false, reason: 'Origin and destination are identical; movement requires a step.' }
  }

  if (rowDiff > 0 && colDiff > 0) {
    return { allowed: false, reason: 'Diagonal movement is strictly forbidden. Only 4-directional steps are allowed.' }
  }

  if (rowDiff + colDiff > 1) {
    return { allowed: false, reason: 'Cells are not adjacent. Only single orthogonal steps are permitted.' }
  }

  const targetType = grid[toRow][toCol]
  if (!isTypeTraversable(targetType, options)) {
    if (targetType === CELL_TYPES.WALL) {
      return { allowed: false, reason: 'Destination is a structural wall.' }
    }
    if (targetType === CELL_TYPES.BLOCKED) {
      return { allowed: false, reason: 'Destination is blocked by an obstacle or locked barrier.' }
    }
    if (targetType === CELL_TYPES.FIRE) {
      return { allowed: false, reason: 'Destination is an active fire hazard and unsafe for evacuation.' }
    }
    return { allowed: false, reason: `Destination cell type (${targetType}) is not traversable.` }
  }

  return { allowed: true, reason: `Move allowed to ${targetType} cell [R${toRow + 1}, C${toCol + 1}].` }
}

/**
 * Returns valid, traversable neighboring cells in documented deterministic order:
 * Order: UP, RIGHT, DOWN, LEFT
 *
 * Excludes:
 * - Out-of-bounds coordinates
 * - Non-traversable cells (Walls, Blocked obstacles, Fire hazards)
 *
 * @param {Array<Array<string>>} grid
 * @param {number} row
 * @param {number} col
 * @param {Object} [options]
 * @returns {Array<{ row: number, col: number, direction: string, type: string }>}
 */
export function getValidNeighbors(grid, row, col, options = {}) {
  if (!isInsideGrid(grid, row, col)) return []

  const neighbors = []

  for (const move of MOVEMENT_DIRECTIONS) {
    const nextRow = row + move.rowOffset
    const nextCol = col + move.colOffset

    if (canMoveBetween(grid, row, col, nextRow, nextCol, options)) {
      neighbors.push({
        row: nextRow,
        col: nextCol,
        direction: move.direction,
        type: grid[nextRow][nextCol]
      })
    }
  }

  return neighbors
}

/**
 * Locates the unique Start cell in the grid.
 * @param {Array<Array<string>>} grid
 * @returns {{ row: number, col: number } | null}
 */
export function findStartCell(grid) {
  if (!grid || !Array.isArray(grid)) return null
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === CELL_TYPES.START) {
        return { row: r, col: c }
      }
    }
  }
  return null
}

/**
 * Locates all Emergency Exit cells in the grid.
 * @param {Array<Array<string>>} grid
 * @returns {Array<{ row: number, col: number }>}
 */
export function findAllExitCells(grid) {
  if (!grid || !Array.isArray(grid)) return []
  const exits = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === CELL_TYPES.EXIT) {
        exits.push({ row: r, col: c })
      }
    }
  }
  return exits
}

/**
 * Counts all grid elements by type.
 * @param {Array<Array<string>>} grid
 * @returns {{ total: number, walkable: number, wall: number, start: number, exit: number, fire: number, blocked: number, unknown: number }}
 */
export function countGridFeatures(grid) {
  const counts = {
    total: 0,
    walkable: 0,
    wall: 0,
    start: 0,
    exit: 0,
    fire: 0,
    blocked: 0,
    unknown: 0
  }

  if (!grid || !Array.isArray(grid) || grid.length === 0) return counts

  counts.total = grid.length * (grid[0]?.length || 0)

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const type = grid[r][c]
      switch (type) {
        case CELL_TYPES.EMPTY:
          counts.walkable++
          break
        case CELL_TYPES.WALL:
          counts.wall++
          break
        case CELL_TYPES.START:
          counts.start++
          break
        case CELL_TYPES.EXIT:
          counts.exit++
          break
        case CELL_TYPES.FIRE:
          counts.fire++
          break
        case CELL_TYPES.BLOCKED:
          counts.blocked++
          break
        default:
          counts.unknown++
          break
      }
    }
  }

  return counts
}

/**
 * Comprehensive grid validation for architectural layout and algorithm readiness.
 * Used by Stage 3 live UI and Stage 4 pathfinding preparation.
 *
 * Checks:
 * - Valid grid dimensions (non-empty matrix, rectangular uniform rows).
 * - Recognized cell types (no invalid strings).
 * - Exactly 1 Start location.
 * - At least 1 Emergency Exit location.
 * - Start and Exit coordinates are valid within boundaries and do not overlap.
 * - Start location is not completely surrounded by walls.
 *
 * @param {Array<Array<string>>} grid
 * @returns {{
 *   isValid: boolean,
 *   algorithmReady: boolean,
 *   errors: string[],
 *   warnings: string[],
 *   counts: { total: number, walkable: number, wall: number, start: number, exit: number, fire: number, blocked: number },
 *   startPosition: { row: number, col: number } | null,
 *   exitPositions: Array<{ row: number, col: number }>,
 *   dimensions: { rows: number, cols: number }
 * }}
 */
export function validateGrid(grid) {
  const errors = []
  const warnings = []

  // Check 1: Structure & Dimensions
  if (!grid || !Array.isArray(grid) || grid.length === 0) {
    errors.push('Grid structure is invalid or empty.')
    return {
      isValid: false,
      algorithmReady: false,
      errors,
      warnings,
      counts: { total: 0, walkable: 0, wall: 0, start: 0, exit: 0, fire: 0, blocked: 0 },
      startPosition: null,
      exitPositions: [],
      dimensions: { rows: 0, cols: 0 }
    }
  }

  const rows = grid.length
  const cols = grid[0]?.length || 0

  if (cols === 0) {
    errors.push('Grid has 0 columns.')
  }

  // Verify rectangular uniformity
  for (let r = 0; r < rows; r++) {
    if (!Array.isArray(grid[r]) || grid[r].length !== cols) {
      errors.push(`Row ${r + 1} has inconsistent length (${grid[r]?.length || 0} vs expected ${cols}).`)
      break
    }
  }

  // Check 2: Cell scanning & type recognition
  const validTypes = new Set(Object.values(CELL_TYPES))
  let startCount = 0
  let exitCount = 0
  let fireCount = 0
  let wallCount = 0
  let blockedCount = 0
  let walkableCount = 0
  let unknownCount = 0
  let startPosition = null
  const exitPositions = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const type = grid[r][c]

      if (!validTypes.has(type)) {
        unknownCount++
      }

      if (type === CELL_TYPES.START) {
        startCount++
        startPosition = { row: r, col: c }
      } else if (type === CELL_TYPES.EXIT) {
        exitCount++
        exitPositions.push({ row: r, col: c })
      } else if (type === CELL_TYPES.FIRE) {
        fireCount++
      } else if (type === CELL_TYPES.WALL) {
        wallCount++
      } else if (type === CELL_TYPES.BLOCKED) {
        blockedCount++
      } else if (type === CELL_TYPES.EMPTY) {
        walkableCount++
      }
    }
  }

  if (unknownCount > 0) {
    errors.push(`Grid contains ${unknownCount} unrecognized cell type(s).`)
  }

  // Check 3: Exactly 1 Start location
  if (startCount === 0) {
    errors.push('No Evacuee Start location placed. Use the Start tool to mark an evacuee origin.')
  } else if (startCount > 1) {
    errors.push(`Multiple Start locations (${startCount}) detected. Exactly 1 Start location is allowed.`)
  }

  // Check 4: At least 1 Emergency Exit
  if (exitCount === 0) {
    errors.push('No Emergency Exit configured. Place at least one Exit cell for evacuation egress.')
  }

  // Check 5: Overlap check
  if (startPosition) {
    const isOverlapping = exitPositions.some(
      (pos) => pos.row === startPosition.row && pos.col === startPosition.col
    )
    if (isOverlapping) {
      errors.push('Start location and Emergency Exit cannot occupy the same cell.')
    }
  }

  // Check 6: Check Start trapped by walls/blocked
  if (startPosition && errors.length === 0) {
    const validStartNeighbors = getValidNeighbors(grid, startPosition.row, startPosition.col)
    if (validStartNeighbors.length === 0) {
      warnings.push('Start location is completely enclosed by obstacles with 0 initial movements.')
    }
  }

  // Warning on heavy fire coverage
  if (fireCount > 10) {
    warnings.push('High hazard count: extensive fire coverage may challenge future route calculation.')
  }

  const isValid = errors.length === 0
  const algorithmReady = isValid && startCount === 1 && exitCount >= 1

  return {
    isValid,
    algorithmReady,
    errors,
    warnings,
    counts: {
      total: rows * cols,
      start: startCount,
      exit: exitCount,
      fire: fireCount,
      wall: wallCount,
      blocked: blockedCount,
      walkable: walkableCount
    },
    startPosition,
    exitPositions,
    dimensions: { rows, cols }
  }
}

/**
 * Alias for pathfinding readiness verification
 */
export const validateGridForPathfinding = validateGrid

/**
 * Apply the selected editing tool to a specific cell in the grid
 * Enforces:
 * - Only 1 Start allowed: placing a new Start moves the previous Start cell to EMPTY.
 * - Start and Exit cannot overlap.
 * - Changing Start or Exit updates underlying grid state cleanly.
 */
export function applyToolToCell(grid, targetRow, targetCol, tool) {
  const newGrid = cloneGrid(grid)
  const currentType = newGrid[targetRow][targetCol]

  // If clicked with the same tool, toggle to Empty (except for Start & Exit which should remain placed)
  if (currentType === tool && tool !== CELL_TYPES.START && tool !== CELL_TYPES.EXIT) {
    newGrid[targetRow][targetCol] = CELL_TYPES.EMPTY
    return newGrid
  }

  if (tool === CELL_TYPES.START) {
    // Relocate any existing START cell on the grid to EMPTY
    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[r].length; c++) {
        if (newGrid[r][c] === CELL_TYPES.START) {
          newGrid[r][c] = CELL_TYPES.EMPTY
        }
      }
    }
    newGrid[targetRow][targetCol] = CELL_TYPES.START
    return newGrid
  }

  newGrid[targetRow][targetCol] = tool
  return newGrid
}

/**
 * Formats a coordinate pair for human readability e.g. [R8, C2]
 * @param {{ row: number, col: number } | null} pos
 * @returns {string}
 */
export function formatCoord(pos) {
  if (!pos) return 'None'
  return `[R${pos.row + 1}, C${pos.col + 1}]`
}
