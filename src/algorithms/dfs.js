/**
 * Depth-First Search (DFS) Evacuation Pathfinding Algorithm
 * Stage 6: Remaining Algorithms and Evacuation Animation
 *
 * Traverses as deeply as possible along each branch before backtracking.
 * Finds a valid safe evacuation route if one exists.
 * Note: DFS is an uninformed search that explores deep corridors first;
 * it does NOT guarantee the shortest or optimal evacuation path.
 *
 * Characteristics:
 * - Internal Data Structure: Last-In, First-Out (LIFO) Stack
 * - Exploration Order: Deterministic (UP, RIGHT, DOWN, LEFT)
 * - Safe Route Rules: Impassable to Walls, Blocked obstacles, and Fire hazards
 * - Non-destructive: Never mutates the input grid matrix
 */

import {
  findStartCell,
  findAllExitCells,
  getValidNeighbors,
  validateGrid
} from '../utils/gridUtils.js'

/**
 * Executes Depth-First Search on a building grid.
 *
 * @param {Array<Array<string>>} grid - 2D matrix of cell types
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.allowFire=false] - Whether to allow traversing fire hazards
 * @returns {{
 *   success: boolean,
 *   selectedExit: { row: number, col: number } | null,
 *   path: Array<{ row: number, col: number }>,
 *   explored: Array<{ row: number, col: number }>,
 *   pathLength: number,
 *   exploredCount: number,
 *   executionTimeMs: number,
 *   status: 'SUCCESS' | 'NO_ROUTE' | 'INVALID_GRID',
 *   message: string,
 *   algorithm: 'DFS'
 * }}
 */
export function runDFS(grid, options = {}) {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

  // 1. Grid structure and pathfinding readiness validation
  const validation = validateGrid(grid)
  if (!validation.isValid) {
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime
    return {
      success: false,
      selectedExit: null,
      path: [],
      explored: [],
      pathLength: 0,
      exploredCount: 0,
      executionTimeMs: Number(elapsed.toFixed(3)),
      status: 'INVALID_GRID',
      message: `Grid validation failed: ${validation.errors.join('; ')}`,
      algorithm: 'DFS'
    }
  }

  const startCoord = findStartCell(grid)
  const exitCoords = findAllExitCells(grid)

  if (!startCoord) {
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime
    return {
      success: false,
      selectedExit: null,
      path: [],
      explored: [],
      pathLength: 0,
      exploredCount: 0,
      executionTimeMs: Number(elapsed.toFixed(3)),
      status: 'INVALID_GRID',
      message: 'Evacuee Start location is not defined on the grid.',
      algorithm: 'DFS'
    }
  }

  if (exitCoords.length === 0) {
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime
    return {
      success: false,
      selectedExit: null,
      path: [],
      explored: [],
      pathLength: 0,
      exploredCount: 0,
      executionTimeMs: Number(elapsed.toFixed(3)),
      status: 'INVALID_GRID',
      message: 'No Emergency Exit doors configured on the grid.',
      algorithm: 'DFS'
    }
  }

  const exitKeySet = new Set(exitCoords.map((e) => `${e.row},${e.col}`))

  // Edge case: Start already IS an Exit
  const startKey = `${startCoord.row},${startCoord.col}`
  if (exitKeySet.has(startKey)) {
    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startTime
    return {
      success: true,
      selectedExit: { ...startCoord },
      path: [{ ...startCoord }],
      explored: [{ ...startCoord }],
      pathLength: 0,
      exploredCount: 1,
      executionTimeMs: Number(elapsed.toFixed(3)),
      status: 'SUCCESS',
      message: 'Start location is already at an Emergency Exit.',
      algorithm: 'DFS'
    }
  }

  // 2. Initialize DFS data structures
  // Using an explicit LIFO stack containing { coord, parentKey }
  const stack = [{ coord: startCoord, parentKey: null }]
  const visited = new Set() // Set of string keys "row,col"
  const parentMap = new Map() // Key -> predecessor { row, col }
  const explored = [] // Chronological list of explored cells

  let foundExit = null

  // 3. Stack Loop
  while (stack.length > 0) {
    const { coord: current, parentKey } = stack.pop()
    const currentKey = `${current.row},${current.col}`

    if (visited.has(currentKey)) {
      continue
    }

    visited.add(currentKey)
    explored.push(current)

    if (parentKey !== null && !parentMap.has(currentKey)) {
      const [pRow, pCol] = parentKey.split(',').map(Number)
      parentMap.set(currentKey, { row: pRow, col: pCol })
    }

    // Check if the current node is an Emergency Exit
    if (exitKeySet.has(currentKey)) {
      foundExit = current
      break
    }

    // Discover valid neighbors in deterministic order: UP, RIGHT, DOWN, LEFT
    const neighbors = getValidNeighbors(grid, current.row, current.col, options)

    // To explore UP first, we push onto LIFO stack in reverse order: LEFT, DOWN, RIGHT, UP
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i]
      const neighborKey = `${neighbor.row},${neighbor.col}`
      if (!visited.has(neighborKey)) {
        stack.push({
          coord: { row: neighbor.row, col: neighbor.col },
          parentKey: currentKey
        })
      }
    }
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const rawElapsed = endTime - startTime
  const executionTimeMs = Number((rawElapsed > 0.001 ? rawElapsed : 0.01).toFixed(3))

  // 4. Reconstruct path if an exit was reached
  if (foundExit) {
    const path = []
    let curr = foundExit

    while (curr) {
      path.push(curr)
      const key = `${curr.row},${curr.col}`
      curr = parentMap.get(key)
    }

    path.reverse()
    const pathLength = path.length - 1

    return {
      success: true,
      selectedExit: foundExit,
      path,
      explored,
      pathLength,
      exploredCount: explored.length,
      executionTimeMs,
      status: 'SUCCESS',
      message: `Safe evacuation path found using DFS to exit [R${foundExit.row + 1}, C${foundExit.col + 1}] in ${pathLength} moves.`,
      algorithm: 'DFS'
    }
  }

  // 5. No reachable exit found
  return {
    success: false,
    selectedExit: null,
    path: [],
    explored,
    pathLength: 0,
    exploredCount: explored.length,
    executionTimeMs,
    status: 'NO_ROUTE',
    message: 'No safe evacuation route available: all pathways to emergency exits are obstructed by walls, barricades, or fire hazards.',
    algorithm: 'DFS'
  }
}
