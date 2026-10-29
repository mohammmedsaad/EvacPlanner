/**
 * Breadth-First Search (BFS) Evacuation Pathfinding Algorithm
 * Stage 5: BFS Pathfinding — First Working Evacuation Algorithm
 *
 * Guarantees the shortest safe evacuation route (minimum moves/edges)
 * from the evacuee Start position to the nearest reachable Emergency Exit.
 *
 * Characteristics:
 * - Internal Data Structure: First-In, First-Out (FIFO) Queue
 * - Frontier Expansion Order: UP, RIGHT, DOWN, LEFT (deterministic)
 * - Optimality: Guaranteed optimal (shortest path) on uniform-cost grids
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
 * Executes Breadth-First Search on a building grid.
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
 *   algorithm: 'BFS'
 * }}
 */
export function runBFS(grid, options = {}) {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

  // 1. Grid structure and pathfinding validation
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
      algorithm: 'BFS'
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
      algorithm: 'BFS'
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
      algorithm: 'BFS'
    }
  }

  // Set of exit coordinates for O(1) destination checks
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
      algorithm: 'BFS'
    }
  }

  // 2. Initialize BFS data structures
  const queue = [] // FIFO queue storing { row, col }
  const visited = new Set() // Set of string keys "row,col"
  const parentMap = new Map() // Map from "row,col" to predecessor { row, col }
  const explored = [] // Ordered list of all explored (dequeued) nodes

  // Enqueue start
  queue.push(startCoord)
  visited.add(startKey)

  let foundExit = null

  // 3. FIFO Queue Loop
  while (queue.length > 0) {
    const current = queue.shift()
    explored.push(current)
    const currentKey = `${current.row},${current.col}`

    // Check if the current node is an Emergency Exit
    if (exitKeySet.has(currentKey)) {
      foundExit = current
      break
    }

    // Discover valid traversable neighbors in deterministic order: UP, RIGHT, DOWN, LEFT
    const neighbors = getValidNeighbors(grid, current.row, current.col, options)

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`

      if (!visited.has(neighborKey)) {
        visited.add(neighborKey)
        parentMap.set(neighborKey, current)
        queue.push({ row: neighbor.row, col: neighbor.col })

        // Early termination on finding an exit in unweighted grid
        if (exitKeySet.has(neighborKey)) {
          explored.push({ row: neighbor.row, col: neighbor.col })
          foundExit = { row: neighbor.row, col: neighbor.col }
          break
        }
      }
    }

    if (foundExit) {
      break
    }
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const rawElapsed = endTime - startTime
  const executionTimeMs = Number((rawElapsed > 0.001 ? rawElapsed : 0.01).toFixed(3))

  // 4. Reconstruct path if an exit was found
  if (foundExit) {
    const path = []
    let curr = foundExit

    while (curr) {
      path.push(curr)
      const key = `${curr.row},${curr.col}`
      curr = parentMap.get(key)
    }

    // Path was constructed backwards (from Exit to Start); reverse to Start -> Exit
    path.reverse()

    // Path length measured in moves (number of edges = path.length - 1)
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
      message: `Optimal evacuation path found to exit [R${foundExit.row + 1}, C${foundExit.col + 1}] in ${pathLength} moves.`,
      algorithm: 'BFS'
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
    algorithm: 'BFS'
  }
}
