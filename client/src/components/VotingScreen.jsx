import { useState } from 'react'
import { motion } from 'framer-motion'
import Chat from './Chat'

function VotingScreen({ 
  players, 
  currentPlayer, 
  editHistory, 
  meetingCaller,
  timeRemaining,
  onVote,
  chatMessages,
  onSendMessage
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = () => {
    if (selectedPlayer !== null) {
      onVote(selectedPlayer)
      setHasVoted(true)
    }
  }

  const handleSkip = () => {
    onVote('skip')
    setHasVoted(true)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const alivePlayers = players.filter(p => p.isAlive)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-terminal-bg"
    >
      {/* Header */}
      <div className="bg-terminal-red/20 border-b border-terminal-red px-6 py-4 text-center">
        <motion.h2 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="font-display text-3xl text-terminal-red glow-text-red">
          🚨 EMERGENCY MEETING 🚨
        </motion.h2>
        <p className="text-gray-400 mt-2">
          Called by <span className="text-white font-bold">{meetingCaller}</span>
        </p>
      </div>

      <div className="flex-1 flex">
        {/* Left - Edit History */}
        <div className="w-96 bg-panel-bg border-r border-panel-border flex flex-col">
          <div className="p-4 border-b border-panel-border">
            <h3 className="font-display text-terminal-green text-sm">EDIT HISTORY</h3>
            <p className="text-xs text-gray-500 mt-1">Recent code changes</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {editHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No edits recorded yet.</p>
            ) : (
              editHistory.slice().reverse().map((edit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="terminal-panel p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="font-bold text-sm"
                      style={{ color: players.find(p => p.id === edit.playerId)?.color || '#00ff88' }}
                    >
                      {edit.playerName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(edit.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs">
                    {edit.charDiff > 0 ? (
                      <span className="text-terminal-green">+{edit.charDiff} chars</span>
                    ) : edit.charDiff < 0 ? (
                      <span className="text-terminal-red">{edit.charDiff} chars</span>
                    ) : (
                      <span className="text-gray-500">No change</span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Center - Voting */}
        <div className="flex-1 flex flex-col p-8">
          <div className="text-center mb-8">
            <div className={`timer text-4xl ${timeRemaining <= 10 ? 'warning' : ''}`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-gray-400 mt-2">Vote for who you think is the impostor</p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            {alivePlayers.map((player, index) => {
              const isCurrentPlayer = player.id === currentPlayer?.id
              const isSelected = selectedPlayer === player.id
              
              return (
                <motion.button
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !hasVoted && !isCurrentPlayer && setSelectedPlayer(player.id)}
                  disabled={hasVoted || isCurrentPlayer}
                  className={`vote-button terminal-panel p-6 text-center transition-all ${
                    isSelected ? 'selected border-terminal-green' : ''
                  } ${isCurrentPlayer ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-terminal-green/50'}`}
                >
                  <div 
                    className="w-20 h-20 mx-auto rounded-full mb-4 flex items-center justify-center text-3xl font-bold"
                    style={{ backgroundColor: player.color + '30', borderColor: isSelected ? '#00ff88' : player.color, borderWidth: 3 }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-bold text-lg">{player.name}</p>
                  {isCurrentPlayer && <span className="text-xs text-gray-500 block mt-1">(Can't vote for yourself)</span>}
                  {isSelected && <span className="text-terminal-green text-sm mt-2 block">✓ Selected</span>}
                </motion.button>
              )
            })}
          </div>

          {!hasVoted ? (
            <div className="flex gap-4 justify-center">
              <button onClick={handleSkip} className="cyber-button">Skip Vote</button>
              <button onClick={handleVote} disabled={selectedPlayer === null} className="cyber-button danger">Vote to Eject</button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-terminal-green">
              <p className="text-xl">✓ Vote submitted</p>
              <p className="text-gray-400 text-sm mt-2">Waiting for other players...</p>
            </motion.div>
          )}
        </div>

        {/* Right - Chat */}
        <div className="w-80 bg-panel-bg border-l border-panel-border flex flex-col">
          <div className="p-4 border-b border-panel-border">
            <h3 className="font-display text-terminal-green text-sm">DISCUSSION</h3>
          </div>
          <div className="flex-1 min-h-0">
            <Chat messages={chatMessages} onSendMessage={onSendMessage} currentPlayer={currentPlayer} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default VotingScreen
