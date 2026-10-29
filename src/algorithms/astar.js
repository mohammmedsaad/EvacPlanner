/**
 * A* Search Evacuation Pathfinding Algorithm
 * Stage 6: Remaining Algorithms and Evacuation Animation
 *
 * Combines exact path cost from start g(n) with an admissible heuristic h(n)
 * estimating remaining distance to the nearest emergency exit:
 *   f(n) = g(n) + h(n)
 *
 * In this unweighted 4-directional grid with uniform step cost (1 move),
 * the Manhattan distance heuristic is both admissible and consistent,
 * guaranteeing the discovery of an optimal shortest evacuation route.
 *
 * Characteristics:
 * - Priority Queue / Min-Heap exploration sorted by f(n), tie-breaking on h(n)
 * - Heuristic: h(n) = min_{exit} (|row - exit.row| + |col - exit.col|)
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
 * Executes A* Search on a building grid.
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
 *   algorithm: 'ASTAR'
 * }}
 */
export function runAStar(grid, options = {}) {
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
      algorithm: 'ASTAR'
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
      algorithm: 'ASTAR'
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
      algorithm: 'ASTAR'
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
      algorithm: 'ASTAR'
    }
  }

  // 2. Initialize A* data structures
  const gScore = new Map() // Key -> exact moves from start
  const fScore = new Map() // Key -> f(n) = g(n) + h(n)
  const parentMap = new Map() // Key -> predecessor { row, col }
  const closedSet = new Set() // Set of evaluated coordinates
  const explored = [] // Chronological list of explored (expanded) cells

  const startH = getMinManhattan(startCoord, exitCoords)
  gScore.set(startKey, 0)
  fScore.set(startKey, startH)

  // Open set priority queue: items are { coord, f, h, seq }
  let seqCounter = 0
  const openSet = [{ coord: startCoord, f: startH, h: startH, seq: seqCounter++ }]

  let foundExit = null

  // 3. Search Loop
  while (openSet.length > 0) {
    // Sort to extract the node with lowest f(n); tie-break by lower h(n), then earlier seq
    openSet.sort((a, b) => {
      if (a.f !== b.f) return a.f - b.f
      if (a.h !== b.h) return a.h - b.h
      return a.seq - b.seq
    })

    const { coord: current } = openSet.shift()
    const currentKey = `${current.row},${current.col}`

    // If already evaluated via an equal or better path, skip
    if (closedSet.has(currentKey)) {
      continue
    }

    closedSet.add(currentKey)
    explored.push(current)

    // Goal test: upon extracting from open set, shortest path is guaranteed
    if (exitKeySet.has(currentKey)) {
      foundExit = current
      break
    }

    const currentG = gScore.get(currentKey) ?? Infinity

    // Discover valid neighbors in deterministic order: UP, RIGHT, DOWN, LEFT
    const neighbors = getValidNeighbors(grid, current.row, current.col, options)

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`

      if (closedSet.has(neighborKey)) {
        continue
      }

      const tentativeG = currentG + 1
      const knownG = gScore.get(neighborKey) ?? Infinity

      if (tentativeG < knownG) {
        parentMap.set(neighborKey, current)
        gScore.set(neighborKey, tentativeG)

        const h = getMinManhattan(neighbor, exitCoords)
        const f = tentativeG + h
        fScore.set(neighborKey, f)

        openSet.push({
          coord: { row: neighbor.row, col: neighbor.col },
          f,
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
      message: `Optimal evacuation path found using A* Search to exit [R${foundExit.row + 1}, C${foundExit.col + 1}] in ${pathLength} moves.`,
      algorithm: 'ASTAR'
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
    algorithm: 'ASTAR'
  }
}
