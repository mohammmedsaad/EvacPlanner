/**
 * Greedy Best-First Search Evacuation Pathfinding Algorithm
 * Stage 6: Remaining Algorithms and Evacuation Animation
 *
 * Uses heuristic evaluation function f(n) = h(n) to prioritize nodes
 * that are geographically closest to an emergency exit.
 *
 * Characteristics:
 * - Priority Queue sorted strictly by h(n) [Manhattan distance to closest exit]
 * - Fast exploration towards exits, but can be diverted by obstacles/dead ends
 * - Does NOT guarantee the shortest or optimal evacuation path
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
 * Computes the minimum Manhattan distance from a coordinate to any exit.
 *
 * @param {{ row: number, col: number }} coord
 * @param {Array<{ row: number, col: number }>} exits
 * @returns {number}
 */
function getMinManhattan(coord, exits) {
  let minH = Infinity
  for (let i = 0; i < exits.length; i++) {
    const d = Math.abs(coord.row - exits[i].row) + Math.abs(coord.col - exits[i].col)
    if (d < minH) {
      minH = d
    }
  }
  return minH
}

/**
 * Executes Greedy Best-First Search on a building grid.
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
 *   algorithm: 'GREEDY'
 * }}
 */
export function runGreedy(grid, options = {}) {
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
      algorithm: 'GREEDY'
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
      algorithm: 'GREEDY'
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
      algorithm: 'GREEDY'
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
      algorithm: 'GREEDY'
    }
  }

  // 2. Initialize Greedy Best-First Search data structures
  const parentMap = new Map() // Key -> predecessor { row, col }
  const visited = new Set() // Set of string keys "row,col"
  const explored = [] // Chronological list of explored (expanded) cells

  let seqCounter = 0
  const startH = getMinManhattan(startCoord, exitCoords)
  // Priority queue sorted strictly by h(n)
  const openSet = [{ coord: startCoord, h: startH, seq: seqCounter++ }]

  let foundExit = null

  // 3. Search Loop
  while (openSet.length > 0) {
    // Sort to extract the node with lowest h(n); tie-break by earlier seq
    openSet.sort((a, b) => {
      if (a.h !== b.h) return a.h - b.h
      return a.seq - b.seq
    })

    const { coord: current } = openSet.shift()
    const currentKey = `${current.row},${current.col}`

    if (visited.has(currentKey)) {
      continue
    }

    visited.add(currentKey)
    explored.push(current)

    // Goal test
    if (exitKeySet.has(currentKey)) {
      foundExit = current
      break
    }

    // Discover valid neighbors in deterministic order: UP, RIGHT, DOWN, LEFT
    const neighbors = getValidNeighbors(grid, current.row, current.col, options)

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`

      if (!visited.has(neighborKey)) {
        if (!parentMap.has(neighborKey)) {
          parentMap.set(neighborKey, current)
        }

        const h = getMinManhattan(neighbor, exitCoords)
        openSet.push({
          coord: { row: neighbor.row, col: neighbor.col },
          h,
          seq: seqCounter++
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
      message: `Safe evacuation path found using Greedy Best-First Search to exit [R${foundExit.row + 1}, C${foundExit.col + 1}] in ${pathLength} moves.`,
      algorithm: 'GREEDY'
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
    algorithm: 'GREEDY'
  }
}
