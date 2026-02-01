import { useState } from 'react'
import { motion } from 'framer-motion'

function HomeScreen({ onCreateRoom, onJoinRoom }) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [mode, setMode] = useState('menu')

  const handleCreate = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.trim())
    }
  }

  const handleJoin = () => {
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-8"
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h1 className="font-display text-7xl md:text-9xl font-black tracking-wider text-terminal-green glow-text">
          LGTM
        </h1>
        <p className="text-terminal-yellow text-xl md:text-2xl font-display mt-2">
          Looks Good To Me<span className="text-terminal-red">?</span>
        </p>
        <p className="text-gray-400 mt-6 text-lg tracking-wide">
          Engineers vs Impostor • Complete the code • Find the saboteur
        </p>
      </motion.div>

      {/* Terminal container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="terminal-panel p-8 w-full max-w-md"
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-panel-border">
          <div className="w-3 h-3 rounded-full bg-terminal-red" />
          <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
          <div className="w-3 h-3 rounded-full bg-terminal-green" />
          <span className="ml-4 text-gray-500 text-sm">terminal@lgtm</span>
        </div>

        {mode === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-terminal-green mb-6">
              <span className="text-gray-500">$</span> Welcome, Engineer. Select operation:
            </div>
            
            <button onClick={() => setMode('create')} className="cyber-button w-full">
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Room
              </span>
            </button>
            
            <button onClick={() => setMode('join')} className="cyber-button w-full">
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                </svg>
                Join Room
              </span>
            </button>
          </motion.div>
        )}

        {mode === 'create' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-terminal-green">
              <span className="text-gray-500">$</span> Enter your codename:
            </div>
            
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter codename..."
              className="cyber-input w-full"
              maxLength={15}
              autoFocus
            />
            
            <div className="flex gap-4">
              <button onClick={() => setMode('menu')} className="cyber-button flex-1">
                Back
              </button>
              <button onClick={handleCreate} disabled={!playerName.trim()} className="cyber-button flex-1">
                Create
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-terminal-green">
              <span className="text-gray-500">$</span> Enter credentials:
            </div>
            
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your codename..."
              className="cyber-input w-full"
              maxLength={15}
              autoFocus
            />
            
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Room code..."
              className="cyber-input w-full uppercase"
              maxLength={6}
            />
            
            <div className="flex gap-4">
              <button onClick={() => setMode('menu')} className="cyber-button flex-1">
                Back
              </button>
              <button onClick={handleJoin} disabled={!playerName.trim() || !roomCode.trim()} className="cyber-button flex-1">
                Join
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* How to play */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center max-w-2xl"
      >
        <h3 className="text-terminal-green font-display text-lg mb-4">HOW TO PLAY</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-400">
          <div className="terminal-panel p-4">
            <div className="text-terminal-green font-bold mb-2">🔧 ENGINEERS (3)</div>
            <p>Work together to complete the coding task before time runs out. Watch for suspicious edits!</p>
          </div>
          <div className="terminal-panel p-4">
            <div className="text-terminal-red font-bold mb-2">🔪 IMPOSTOR (1)</div>
            <p>Secretly sabotage the code without getting caught. Delete code, add bugs, cause chaos!</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default HomeScreen
