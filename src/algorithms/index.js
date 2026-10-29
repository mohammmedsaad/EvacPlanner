/**
 * Emergency Building Evacuation Planner — Pathfinding Algorithms
 * Stage 6: Remaining Algorithms and Evacuation Animation
 */

import { runBFS } from './bfs.js'
import { runDFS } from './dfs.js'
import { runAStar } from './astar.js'
import { runGreedy } from './greedy.js'

export { runBFS, runDFS, runAStar, runGreedy }

/**
 * Dispatcher function to execute any configured algorithm by ID.
 *
 * @param {'BFS' | 'DFS' | 'ASTAR' | 'GREEDY'} algorithmId
 * @param {Array<Array<string>>} grid
 * @param {Object} [options]
 * @returns {Object} Structured simulation result
 */
export function runAlgorithm(algorithmId, grid, options = {}) {
  switch (algorithmId) {
    case 'BFS':
      return runBFS(grid, options)
    case 'DFS':
      return runDFS(grid, options)
    case 'ASTAR':
      return runAStar(grid, options)
    case 'GREEDY':
      return runGreedy(grid, options)
    default:
      return runBFS(grid, options)
  }
}
