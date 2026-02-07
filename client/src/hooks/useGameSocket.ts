import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  GameState,
  Player,
  Task,
  GameResult,
  ChatMessage,
  EditHistoryEntry,
  ServerMessage,
} from '@/types'
import { getWsUrl } from '@/config/constants'

const ERROR_DISMISS_MS = 3000
const TASK_FAILED_DISMISS_MS = 5000

function handleServerMessage(
  msg: ServerMessage,
  setters: {
    setGameState: (s: GameState) => void
    setRoomCode: (c: string) => void
    setPlayer: (p: Player | null) => void
    setPlayers: (p: Player[]) => void
    setRole: (r: string | null) => void
    setTask: (t: Task | null) => void
    setCode: (c: string) => void
    setTimeRemaining: (n: number) => void
    setLastEditor: (e: { name: string; id: string } | null) => void
    setEditHistory: (h: EditHistoryEntry[]) => void
    setMeetingCaller: (c: string | null) => void
    setVotingTimeRemaining: (n: number) => void
    setGameResult: (r: GameResult | null) => void
    setChatMessages: (fn: (prev: ChatMessage[]) => ChatMessage[]) => void
    setError: (e: string | null) => void
  },
) {
  const s = setters
  switch (msg.type) {
    case 'room-created':
      if (msg.roomCode) s.setRoomCode(msg.roomCode)
      if (msg.player) s.setPlayer(msg.player)
      if (msg.players) s.setPlayers(msg.players)
      s.setGameState('lobby')
      break
    case 'room-joined':
      if (msg.roomCode) s.setRoomCode(msg.roomCode)
      if (msg.player) s.setPlayer(msg.player)
      if (msg.players) s.setPlayers(msg.players)
      s.setGameState('lobby')
      break
    case 'player-list':
      if (msg.players) s.setPlayers(msg.players)
      break
    case 'game-started':
      if (msg.role) s.setRole(msg.role)
      if (msg.task) {
        s.setTask(msg.task)
        s.setCode(msg.task.starterCode)
      }
      if (msg.timeLimit != null) s.setTimeRemaining(msg.timeLimit)
      if (msg.players) s.setPlayers(msg.players)
      s.setGameState('playing')
      s.setChatMessages(() => [])
      break
    case 'code-updated':
      if (msg.code != null) s.setCode(msg.code)
      if (msg.lastEditor != null && msg.lastEditorId != null)
        s.setLastEditor({ name: msg.lastEditor, id: msg.lastEditorId })
      break
    case 'time-update':
      if (msg.timeRemaining != null) s.setTimeRemaining(msg.timeRemaining)
      break
    case 'meeting-called':
      if (msg.caller != null) s.setMeetingCaller(msg.caller)
      s.setEditHistory(msg.editHistory ?? [])
      if (msg.players) s.setPlayers(msg.players)
      s.setVotingTimeRemaining(60)
      s.setGameState('voting')
      break
    case 'voting-time-update':
      if (msg.timeRemaining != null) s.setVotingTimeRemaining(msg.timeRemaining)
      break
    case 'game-resumed':
      if (msg.players) s.setPlayers(msg.players)
      if (msg.timeRemaining != null) s.setTimeRemaining(msg.timeRemaining)
      s.setGameState('playing')
      break
    case 'game-ended':
      s.setGameResult({
        winner: (msg.winner as 'engineers' | 'impostor') ?? 'engineers',
        reason: msg.reason ?? '',
        impostor: msg.impostor,
        players: msg.players ?? [],
      })
      s.setGameState('ended')
      break
    case 'chat-message':
      s.setChatMessages((prev) => [...prev, msg as unknown as ChatMessage])
      break
    case 'task-failed':
      s.setError(`Task failed: ${msg.message ?? ''}`)
      setTimeout(() => s.setError(null), TASK_FAILED_DISMISS_MS)
      break
    case 'error':
      s.setError(msg.message ?? 'Error')
      setTimeout(() => s.setError(null), ERROR_DISMISS_MS)
      break
  }
}

export function useGameSocket() {
  const [gameState, setGameState] = useState<GameState>('home')
  const [player, setPlayer] = useState<Player | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [roomCode, setRoomCode] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [task, setTask] = useState<Task | null>(null)
  const [code, setCode] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(180)
  const [lastEditor, setLastEditor] = useState<{ name: string; id: string } | null>(null)
  const [editHistory, setEditHistory] = useState<EditHistoryEntry[]>([])
  const [meetingCaller, setMeetingCaller] = useState<string | null>(null)
  const [votingTimeRemaining, setVotingTimeRemaining] = useState(60)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const wsRef = useRef<WebSocket | null>(null)

  const onMessage = useCallback((msg: ServerMessage) => {
    handleServerMessage(msg, {
      setGameState,
      setRoomCode,
      setPlayer,
      setPlayers,
      setRole,
      setTask,
      setCode,
      setTimeRemaining,
      setLastEditor,
      setEditHistory,
      setMeetingCaller,
      setVotingTimeRemaining,
      setGameResult,
      setChatMessages,
      setError,
    })
  }, [])

  useEffect(() => {
    const ws = new WebSocket(getWsUrl())
    wsRef.current = ws

    ws.onopen = () => console.log('🔌 Connected to server')
    ws.onmessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data) as ServerMessage
      onMessage(msg)
    }
    ws.onerror = () => setError('Connection error!')
    ws.onclose = () => console.log('🔌 Disconnected from server')

    return () => ws.close()
  }, [onMessage])

  const send = useCallback((type: string, data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }))
    }
  }, [])

  const createRoom = useCallback((playerName: string) => send('create-room', { playerName }), [send])
  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => send('join-room', { roomCode, playerName }),
    [send],
  )
  const startGame = useCallback(() => send('start-game', {}), [send])
  const updateCode = useCallback(
    (newCode: string) => {
      setCode(newCode)
      send('code-update', { code: newCode })
    },
    [send],
  )
  const callMeeting = useCallback(() => send('call-meeting', {}), [send])
  const submitTask = useCallback((passed = true) => send('submit-task', { passed }), [send])
  const castVote = useCallback((targetId: string) => send('cast-vote', { targetId }), [send])
  const sendChatMessage = useCallback((message: string) => send('chat-message', { message }), [send])

  const resetGame = useCallback(() => {
    setGameState('home')
    setPlayer(null)
    setPlayers([])
    setRoomCode('')
    setRole(null)
    setTask(null)
    setCode('')
    setGameResult(null)
    setChatMessages([])
  }, [])

  return {
    gameState,
    player,
    players,
    roomCode,
    role,
    task,
    code,
    timeRemaining,
    lastEditor,
    editHistory,
    meetingCaller,
    votingTimeRemaining,
    gameResult,
    error,
    chatMessages,
    createRoom,
    joinRoom,
    startGame,
    updateCode,
    callMeeting,
    submitTask,
    castVote,
    sendChatMessage,
    resetGame,
  }
}
