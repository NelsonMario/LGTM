import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HomeScreen from './components/HomeScreen'
import LobbyScreen from './components/LobbyScreen'
import GameScreen from './components/GameScreen'
import VotingScreen from './components/VotingScreen'
import ResultScreen from './components/ResultScreen'
import Icon from './components/Icon'

function App() {
  const [gameState, setGameState] = useState('home')
  const [player, setPlayer] = useState(null)
  const [players, setPlayers] = useState([])
  const [roomCode, setRoomCode] = useState('')
  const [role, setRole] = useState(null)
  const [task, setTask] = useState(null)
  const [code, setCode] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(180)
  const [lastEditor, setLastEditor] = useState(null)
  const [editHistory, setEditHistory] = useState([])
  const [meetingCaller, setMeetingCaller] = useState(null)
  const [votingTimeRemaining, setVotingTimeRemaining] = useState(60)
  const [gameResult, setGameResult] = useState(null)
  const [error, setError] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light'
    }
    return 'light'
  })
  
  const wsRef = useRef(null)

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    // Connect to Go WebSocket server
    // Use relative URL in production (Docker), absolute in development
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = import.meta.env.DEV 
      ? 'ws://localhost:3001/ws' 
      : `${wsProtocol}//${window.location.host}/ws`
    
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('🔌 Connected to server')
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      handleServerMessage(msg)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('Connection error!')
    }

    ws.onclose = () => {
      console.log('🔌 Disconnected from server')
    }

    return () => {
      ws.close()
    }
  }, [])

  const handleServerMessage = (msg) => {
    switch (msg.type) {
      case 'room-created':
        setRoomCode(msg.roomCode)
        setPlayer(msg.player)
        setPlayers(msg.players)
        setGameState('lobby')
        break

      case 'room-joined':
        setRoomCode(msg.roomCode)
        setPlayer(msg.player)
        setPlayers(msg.players)
        setGameState('lobby')
        break

      case 'player-list':
        setPlayers(msg.players)
        break

      case 'game-started':
        setRole(msg.role)
        setTask(msg.task)
        setCode(msg.task.starterCode)
        setTimeRemaining(msg.timeLimit)
        setPlayers(msg.players)
        setGameState('playing')
        setChatMessages([])
        break

      case 'code-updated':
        setCode(msg.code)
        setLastEditor({ name: msg.lastEditor, id: msg.lastEditorId })
        break

      case 'time-update':
        setTimeRemaining(msg.timeRemaining)
        break

      case 'meeting-called':
        setMeetingCaller(msg.caller)
        setEditHistory(msg.editHistory || [])
        setPlayers(msg.players)
        setVotingTimeRemaining(60)
        setGameState('voting')
        break

      case 'vote-cast':
        // Update vote count display if needed
        break

      case 'voting-time-update':
        setVotingTimeRemaining(msg.timeRemaining)
        break

      case 'voting-ended':
        // Show ejection result briefly
        break

      case 'game-resumed':
        setPlayers(msg.players)
        setTimeRemaining(msg.timeRemaining)
        setGameState('playing')
        break

      case 'game-ended':
        setGameResult({
          winner: msg.winner,
          reason: msg.reason,
          impostor: msg.impostor,
          players: msg.players
        })
        setGameState('ended')
        break

      case 'chat-message':
        setChatMessages(prev => [...prev, msg])
        break

      case 'task-failed':
        setError(`Task failed: ${msg.message}`)
        setTimeout(() => setError(null), 5000)
        break

      case 'error':
        setError(msg.message)
        setTimeout(() => setError(null), 3000)
        break
    }
  }

  const sendMessage = useCallback((type, data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }))
    }
  }, [])

  const createRoom = useCallback((playerName) => {
    sendMessage('create-room', { playerName })
  }, [sendMessage])

  const joinRoom = useCallback((roomCode, playerName) => {
    sendMessage('join-room', { roomCode, playerName })
  }, [sendMessage])

  const startGame = useCallback(() => {
    sendMessage('start-game', {})
  }, [sendMessage])

  const updateCode = useCallback((newCode) => {
    setCode(newCode)
    sendMessage('code-update', { code: newCode })
  }, [sendMessage])

  const callMeeting = useCallback(() => {
    sendMessage('call-meeting', {})
  }, [sendMessage])

  const submitTask = useCallback((passed = true) => {
    sendMessage('submit-task', { passed })
  }, [sendMessage])

  const castVote = useCallback((targetId) => {
    sendMessage('cast-vote', { targetId })
  }, [sendMessage])

  const sendChatMessage = useCallback((message) => {
    sendMessage('chat-message', { message })
  }, [sendMessage])

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

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle - Only show on home/lobby screens */}
      {(gameState === 'home' || gameState === 'lobby' || gameState === 'ended') && (
        <button
          onClick={toggleTheme}
          className="theme-toggle fixed top-4 right-4 z-40"
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
        </button>
      )}

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-danger/10 border border-danger text-danger px-6 py-3 rounded-xl shadow-medium"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {gameState === 'home' && (
          <HomeScreen 
            key="home"
            onCreateRoom={createRoom} 
            onJoinRoom={joinRoom} 
          />
        )}
        
        {gameState === 'lobby' && (
          <LobbyScreen
            key="lobby"
            roomCode={roomCode}
            players={players}
            currentPlayer={player}
            onStartGame={startGame}
          />
        )}
        
        {gameState === 'playing' && (
          <GameScreen
            key="playing"
            role={role}
            task={task}
            code={code}
            onCodeChange={updateCode}
            timeRemaining={timeRemaining}
            players={players}
            currentPlayer={player}
            lastEditor={lastEditor}
            onCallMeeting={callMeeting}
            onSubmitTask={submitTask}
            chatMessages={chatMessages}
            onSendMessage={sendChatMessage}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        
        {gameState === 'voting' && (
          <VotingScreen
            key="voting"
            players={players}
            currentPlayer={player}
            editHistory={editHistory}
            meetingCaller={meetingCaller}
            timeRemaining={votingTimeRemaining}
            onVote={castVote}
            chatMessages={chatMessages}
            onSendMessage={sendChatMessage}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        
        {gameState === 'ended' && (
          <ResultScreen
            key="ended"
            result={gameResult}
            currentPlayer={player}
            onPlayAgain={resetGame}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
