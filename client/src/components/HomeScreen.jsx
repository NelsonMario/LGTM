import { useState } from 'react'
import { motion } from 'framer-motion'
import Icon from './Icon'

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
      className="min-h-screen flex flex-col items-center justify-center p-8 dot-pattern"
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-10"
      >
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-primary mb-2">
          LGTM
        </h1>
        <p className="text-secondary text-lg">
          Looks Good To Me<span className="text-danger">?</span>
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card p-8 w-full max-w-sm"
      >
        {mode === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <button
              onClick={() => setMode('create')}
              className="btn btn-primary w-full"
            >
              <Icon name="plus" size={16} />
              Create Room
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="btn btn-secondary w-full"
            >
              <Icon name="arrowLeft" size={16} />
              Join Room
            </button>
          </motion.div>
        )}

        {mode === 'create' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="section-header">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="input"
                maxLength={15}
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setMode('menu')} className="btn btn-secondary flex-1">
                Back
              </button>
              <button onClick={handleCreate} disabled={!playerName.trim()} className="btn btn-primary flex-1">
                Create
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="section-header">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="input"
                maxLength={15}
                autoFocus
              />
            </div>
            
            <div>
              <label className="section-header">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter code..."
                className="input font-mono text-center tracking-widest"
                maxLength={6}
              />
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setMode('menu')} className="btn btn-secondary flex-1">
                Back
              </button>
              <button onClick={handleJoin} disabled={!playerName.trim() || !roomCode.trim()} className="btn btn-primary flex-1">
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
        transition={{ delay: 0.4 }}
        className="mt-12 max-w-lg text-center"
      >
        <p className="section-header mb-6">How to Play</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 text-left">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <Icon name="check" size={16} className="text-success" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Engineers</h4>
            <p className="text-secondary text-xs leading-relaxed">
              Complete the coding task together. Watch for suspicious edits.
            </p>
          </div>
          <div className="card p-5 text-left">
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center mb-3">
              <Icon name="x" size={16} className="text-danger" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Impostor</h4>
            <p className="text-secondary text-xs leading-relaxed">
              Sabotage the code secretly without getting caught.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default HomeScreen
