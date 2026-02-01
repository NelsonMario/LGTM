import { useState } from 'react'
import { motion } from 'framer-motion'
import Chat from './Chat'
import Icon from './Icon'

function VotingScreen({ 
  players, 
  currentPlayer, 
  editHistory, 
  meetingCaller,
  timeRemaining,
  onVote,
  chatMessages,
  onSendMessage,
  theme,
  onToggleTheme
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
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <div className="bg-danger/10 border-b border-danger/20 px-6 py-4 relative">
        <div className="text-center">
          <motion.h2
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-xl font-semibold text-danger flex items-center justify-center gap-2"
          >
            <Icon name="alert" size={20} />
            Emergency Meeting
          </motion.h2>
          <p className="text-secondary text-sm mt-1">
            Called by <span className="font-medium text-primary">{meetingCaller}</span>
          </p>
        </div>
        <button
          onClick={onToggleTheme}
          className="btn btn-ghost p-2 absolute top-4 right-4"
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Edit History */}
        <div className="w-80 bg-surface border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="section-header">Edit History</p>
            <p className="text-xs text-muted">Recent code changes</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {editHistory.length === 0 ? (
              <p className="text-muted text-sm">No edits recorded.</p>
            ) : (
              editHistory.slice().reverse().map((edit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="card p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span 
                      className="font-medium text-sm"
                      style={{ color: players.find(p => p.id === edit.playerId)?.color }}
                    >
                      {edit.playerName}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(edit.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs">
                    {edit.charDiff > 0 ? (
                      <span className="test-pass">+{edit.charDiff} chars</span>
                    ) : edit.charDiff < 0 ? (
                      <span className="test-fail">{edit.charDiff} chars</span>
                    ) : (
                      <span className="text-muted">No change</span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Voting Area */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          {/* Timer */}
          <div className="text-center mb-8">
            <div className={`timer text-4xl ${timeRemaining <= 10 ? 'warning' : ''}`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-secondary mt-2 text-sm">Vote for who you think is the impostor</p>
          </div>

          {/* Vote Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto mb-8">
            {alivePlayers.map((player, index) => {
              const isCurrentPlayer = player.id === currentPlayer?.id
              const isSelected = selectedPlayer === player.id
              
              return (
                <motion.button
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !hasVoted && !isCurrentPlayer && setSelectedPlayer(player.id)}
                  disabled={hasVoted || isCurrentPlayer}
                  className={`vote-card ${isSelected ? 'selected' : ''}`}
                >
                  <div 
                    className="w-16 h-16 mx-auto rounded-full mb-3 flex items-center justify-center text-2xl font-semibold text-white"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium">{player.name}</p>
                  {isCurrentPlayer && <span className="text-xs text-muted block mt-1">(You)</span>}
                  {isSelected && <span className="text-xs test-pass block mt-1">Selected</span>}
                </motion.button>
              )
            })}
          </div>

          {/* Vote Actions */}
          {!hasVoted ? (
            <div className="flex gap-3 justify-center">
              <button onClick={handleSkip} className="btn btn-secondary">
                Skip Vote
              </button>
              <button onClick={handleVote} disabled={selectedPlayer === null} className="btn btn-primary">
                Vote to Eject
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-lg font-medium test-pass flex items-center justify-center gap-2">
                <Icon name="check" size={18} /> Vote submitted
              </p>
              <p className="text-secondary text-sm mt-1">Waiting for others...</p>
            </motion.div>
          )}
        </div>

        {/* Chat */}
        <div className="w-72 bg-surface border-l border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="section-header">Discussion</p>
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
