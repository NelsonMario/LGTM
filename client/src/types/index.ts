export type GameState = 'home' | 'lobby' | 'playing' | 'voting' | 'ended'
export type Role = 'engineer' | 'impostor'

export interface Player {
  id: string
  name: string
  color?: string
  isAlive?: boolean
  role?: Role
}

export interface TestCase {
  input: unknown
  expected: unknown
}

export interface Task {
  id: string
  title: string
  description: string
  starterCode: string
  testCases: TestCase[]
  functionName: string
}

export interface GameResult {
  winner: 'engineers' | 'impostor'
  reason: string
  impostor?: Player
  players: Player[]
}

export interface ChatMessage {
  playerId: string
  playerName: string
  message: string
  timestamp?: number
  playerColor?: string
}

export interface EditHistoryEntry {
  playerName?: string
  playerId?: string
  change?: string
  timestamp?: number
  charDiff?: number
}

export interface TestResultItem {
  input: unknown
  expected: unknown
  actual: unknown
  passed: boolean
  executionTime?: number
  error?: string
}

export interface TestRunResult {
  passed: boolean
  results: TestResultItem[]
  error?: string | null
}

export type Theme = 'light' | 'dark'

/** Server WebSocket message payload */
export interface ServerMessage {
  type: string
  roomCode?: string
  player?: Player
  players?: Player[]
  role?: string
  task?: Task
  timeLimit?: number
  timeRemaining?: number
  code?: string
  lastEditor?: string
  lastEditorId?: string
  caller?: string
  editHistory?: EditHistoryEntry[]
  winner?: string
  reason?: string
  impostor?: Player
  message?: string
}
