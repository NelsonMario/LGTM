import { useState } from 'react'
import { motion } from 'framer-motion'
import { Chat } from '@/components/chat'
import { Icon } from '@/components/ui'
import type { Player, ChatMessage, EditHistoryEntry, Theme } from '@/types'

interface VotingScreenProps {
  players: Player[]
  currentPlayer: Player | null
  editHistory: EditHistoryEntry[]
  meetingCaller: string | null
  timeRemaining: number
  onVote: (targetId: string) => void
  chatMessages: ChatMessage[]
  onSendMessage: (message: string) => void
  theme: Theme
  onToggleTheme: () => void
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function VotingScreen({
  players,
  currentPlayer,
  editHistory,
  meetingCaller,
  timeRemaining,
  onVote,
  chatMessages,
  onSendMessage,
  theme,
  onToggleTheme,
}: VotingScreenProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
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

  const alivePlayers = players.filter((p) => p.isAlive !== false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-background"
    >
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
            Called by <span className="font-medium text-primary">{meetingCaller ?? '—'}</span>
          </p>
        </div>
        <button onClick={onToggleTheme} className="btn btn-ghost p-2 absolute top-4 right-4" aria-label="Toggle theme">
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-80 bg-surface border-r-0 lg:border-r border-b lg:border-b-0 border-border flex flex-col shrink-0 max-h-48 lg:max-h-none overflow-y-auto">
          <div className="p-3 sm:p-4 border-b border-border">
            <p className="section-header text-xs">Edit History</p>
            <p className="text-xs text-muted">Recent code changes</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
            {editHistory.length === 0 ? (
              <p className="text-muted text-sm">No edits recorded.</p>
            ) : (
              [...editHistory].reverse().map((edit, index) => (
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
                      style={{ color: players.find((p) => p.id === edit.playerId)?.color ?? undefined }}
                    >
                      {edit.playerName ?? '—'}
                    </span>
                    <span className="text-xs text-muted">
                      {edit.timestamp != null ? new Date(edit.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <div className="text-xs">
                    {edit.charDiff != null ? (
                      edit.charDiff > 0 ? (
                        <span className="test-pass">+{edit.charDiff} chars</span>
                      ) : edit.charDiff < 0 ? (
                        <span className="test-fail">{edit.charDiff} chars</span>
                      ) : (
                        <span className="text-muted">No change</span>
                      )
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="text-center mb-4 sm:mb-8">
            <div className={`timer text-2xl sm:text-3xl lg:text-4xl ${timeRemaining <= 10 ? 'warning' : ''}`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-secondary mt-2 text-xs sm:text-sm">Vote for who you think is the impostor</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto mb-4 sm:mb-8 w-full">
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

          {!hasVoted ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-4">
              <button onClick={handleSkip} className="btn btn-secondary text-sm">Skip Vote</button>
              <button
                onClick={handleVote}
                disabled={selectedPlayer === null}
                className="btn btn-primary text-sm"
              >
                Vote to Eject
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <p className="text-lg font-medium test-pass flex items-center justify-center gap-2">
                <Icon name="check" size={18} /> Vote submitted
              </p>
              <p className="text-secondary text-sm mt-1">Waiting for others...</p>
            </motion.div>
          )}
        </div>

        <div className="w-full lg:w-72 bg-surface border-l-0 lg:border-l border-t lg:border-t-0 border-border flex flex-col shrink-0 max-h-64 lg:max-h-none">
          <div className="p-3 sm:p-4 border-b border-border">
            <p className="section-header text-xs">Discussion</p>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Chat messages={chatMessages} onSendMessage={onSendMessage} currentPlayer={currentPlayer} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
