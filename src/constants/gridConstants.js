/**
 * Grid Constants and Configuration for Emergency Building Evacuation Planner
 * Stage 3: Interactive Building Grid
 */

export const CELL_TYPES = {
  EMPTY: 'EMPTY',
  WALL: 'WALL',
  START: 'START',
  EXIT: 'EXIT',
  FIRE: 'FIRE',
  BLOCKED: 'BLOCKED'
}

export const CELL_CONFIG = {
  [CELL_TYPES.EMPTY]: {
    type: CELL_TYPES.EMPTY,
    label: 'Empty / Walkable',
    shortLabel: 'Walkable',
    description: 'Open corridor through which movement is permitted',
    className: 'cell-walkable',
    legendClass: 'swatch-walkable',
    badgeText: '',
    color: '#0f172a'
  },
  [CELL_TYPES.WALL]: {
    type: CELL_TYPES.WALL,
    label: 'Structural Wall',
    shortLabel: 'Wall',
    description: 'Impassable architectural boundary or load-bearing wall',
    className: 'cell-wall',
    legendClass: 'swatch-wall',
    badgeText: '',
    color: '#334155'
  },
  [CELL_TYPES.START]: {
    type: CELL_TYPES.START,
    label: 'Evacuee Start',
    shortLabel: 'Start',
    description: 'Designated origin location of evacuee (strictly 1 permitted)',
    className: 'cell-start',
    legendClass: 'swatch-start',
    badgeText: 'START',
    color: '#38bdf8'
  },
  [CELL_TYPES.EXIT]: {
    type: CELL_TYPES.EXIT,
    label: 'Emergency Exit',
    shortLabel: 'Exit',
    description: 'Designated emergency evacuation egress doorway',
    className: 'cell-exit',
    legendClass: 'swatch-exit',
    badgeText: 'EXIT',
    color: '#10b981'
  },
  [CELL_TYPES.FIRE]: {
    type: CELL_TYPES.FIRE,
    label: 'Fire Hazard',
    shortLabel: 'Fire',
    description: 'Hazardous active fire zone (impassable for evacuees)',
    className: 'cell-hazard',
    legendClass: 'swatch-hazard',
    badgeText: 'FIRE',
    color: '#ef4444'
  },
  [CELL_TYPES.BLOCKED]: {
    type: CELL_TYPES.BLOCKED,
    label: 'Blocked Obstacle',
    shortLabel: 'Blocked',
    description: 'Explicitly blocked location (debris, barricade, locked security gate)',
    className: 'cell-blocked',
    legendClass: 'swatch-blocked',
    badgeText: 'LOCK',
    color: '#8b5cf6'
  }
}

export const EDIT_TOOLS = [
  {
    type: CELL_TYPES.START,
    label: 'Evacuee Start',
    code: 'START',
    badge: '1 Only',
    color: '#38bdf8',
    hint: 'Place evacuee origin (moves previous start)'
  },
  {
    type: CELL_TYPES.EXIT,
    label: 'Emergency Exit',
    code: 'EXIT',
    badge: 'Multiple',
    color: '#10b981',
    hint: 'Place emergency egress doors'
  },
  {
    type: CELL_TYPES.WALL,
    label: 'Structural Wall',
    code: 'WALL',
    badge: 'Barrier',
    color: '#64748b',
    hint: 'Draw permanent building walls'
  },
  {
    type: CELL_TYPES.FIRE,
    label: 'Fire Hazard',
    code: 'FIRE',
    badge: 'Hazard',
    color: '#ef4444',
    hint: 'Mark active fire outbreaks'
  },
  {
    type: CELL_TYPES.BLOCKED,
    label: 'Blocked / Locked',
    code: 'BLOCKED',
    badge: 'Obstacle',
    color: '#8b5cf6',
    hint: 'Mark locked doors, debris, or barricades'
  },
  {
    type: CELL_TYPES.EMPTY,
    label: 'Eraser / Corridor',
    code: 'CLEAR',
    badge: 'Walkable',
    color: '#94a3b8',
    hint: 'Clear cell back to walkable floor'
  }
]

export const GRID_DIMENSIONS = {
  ROWS: 10,
  COLS: 14
}

/**
 * 4-Directional Movement Vectors
 * Strictly orthogonal (no diagonals allowed)
 * Documented order: UP, RIGHT, DOWN, LEFT
 */
export const MOVEMENT_DIRECTIONS = [
  { rowOffset: -1, colOffset: 0, direction: 'UP' },
  { rowOffset: 0, colOffset: 1, direction: 'RIGHT' },
  { rowOffset: 1, colOffset: 0, direction: 'DOWN' },
  { rowOffset: 0, colOffset: -1, direction: 'LEFT' }
]

/**
 * Default Preset: Engineering Complex Block A
 * 14 columns × 10 rows
 * W = Wall, E = Empty, S = Start, X = Exit, F = Fire, B = Blocked
 */
const W = CELL_TYPES.WALL
const E = CELL_TYPES.EMPTY
const S = CELL_TYPES.START
const X = CELL_TYPES.EXIT
const F = CELL_TYPES.FIRE
const B = CELL_TYPES.BLOCKED

export const PRESET_ENGINEERING_BLOCK_A = [
  [W, W, W, W, W, X, W, W, W, W, W, W, W, W],
  [W, E, E, E, E, E, W, E, E, E, E, E, E, W],
  [W, E, W, W, E, E, W, E, W, W, W, E, E, W],
  [W, E, W, W, E, E, E, E, W, B, W, E, E, X],
  [W, E, E, E, E, F, F, E, W, E, W, E, E, W],
  [W, E, W, W, E, F, W, E, W, E, E, E, E, W],
  [W, E, W, W, E, E, W, E, E, E, W, W, E, W],
  [W, S, E, W, E, E, E, E, B, E, W, W, E, W],
  [W, E, E, E, E, E, W, E, E, E, E, E, E, W],
  [W, W, W, W, W, W, W, W, W, X, W, W, W, W]
]

export const PRESET_SCIENCE_LAB = [
  [W, W, W, X, W, W, W, W, W, W, X, W, W, W],
  [W, E, E, E, E, E, W, E, E, E, E, E, E, W],
  [W, E, W, W, W, E, W, E, W, W, W, W, E, W],
  [W, E, W, F, W, E, E, E, W, E, E, W, E, W],
  [W, E, W, W, W, E, W, E, W, E, B, W, E, X],
  [W, E, E, E, E, E, W, E, E, E, E, W, E, W],
  [W, W, W, E, W, W, W, W, W, E, W, W, E, W],
  [W, S, E, E, E, E, B, E, E, E, E, E, E, W],
  [W, E, W, W, W, E, W, E, W, W, F, W, E, W],
  [W, W, W, W, W, W, W, X, W, W, W, W, W, W]
]

export const PRESET_OPEN_OFFICE = [
  [W, W, W, W, W, X, W, W, W, W, W, W, W, W],
  [W, E, E, E, E, E, E, E, E, E, E, E, E, W],
  [W, E, W, W, E, E, W, W, E, E, W, W, E, W],
  [W, E, W, W, E, E, W, W, E, E, W, W, E, X],
  [W, E, E, E, E, E, E, E, E, F, F, E, E, W],
  [W, E, W, W, E, E, B, E, E, F, W, E, E, W],
  [W, E, W, W, E, E, W, W, E, E, W, W, E, W],
  [W, S, E, E, E, E, E, E, E, E, E, E, E, W],
  [W, E, E, E, E, E, E, E, E, E, E, E, E, W],
  [W, W, W, W, W, W, W, W, W, X, W, W, W, W]
]

export const PRESETS = [
  {
    id: 'bldg-1',
    name: 'Engineering Complex Block A (Default)',
    layout: PRESET_ENGINEERING_BLOCK_A,
    description: 'Standard campus facility with lab corridors, 2 emergency exits, active fire cluster, and blocked security hallway.'
  },
  {
    id: 'bldg-2',
    name: 'Science Laboratory Hall',
    layout: PRESET_SCIENCE_LAB,
    description: 'Compartmentalized research wing featuring chemical storage hazards, locked cleanrooms, and 3 emergency exits.'
  },
  {
    id: 'bldg-3',
    name: 'Open Office Layout',
    layout: PRESET_OPEN_OFFICE,
    description: 'Corporate floor plan with modular cubicle pods, breakout rooms, and perimeter escape egress.'
  }
]

export const DEFAULT_GRID = PRESET_ENGINEERING_BLOCK_A
