import { motion } from 'framer-motion'
import { Icon } from '@/components/ui'
import type { GameResult, Player } from '@/types'

interface ResultScreenProps {
  result: GameResult | null
  currentPlayer: Player | null
  onPlayAgain: () => void
}

export default function ResultScreen({ result, currentPlayer, onPlayAgain }: ResultScreenProps) {
  const isEngineerWin = result?.winner === 'engineers'
  const currentPlayerRole = result?.players?.find((p) => p.id === currentPlayer?.id)?.role
  const didWin =
    (isEngineerWin && currentPlayerRole === 'engineer') ||
    (!isEngineerWin && currentPlayerRole === 'impostor')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 dot-pattern"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${didWin ? 'bg-success/10' : 'bg-danger/10'}`}>
          <Icon name={didWin ? 'check' : 'x'} size={40} className={didWin ? 'text-success' : 'text-danger'} />
        </div>
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 ${didWin ? 'text-success' : 'text-danger'}`}>
          {didWin ? 'Victory' : 'Defeat'}
        </h1>
        <p className="text-lg sm:text-xl text-secondary">
          {isEngineerWin ? 'Engineers Win' : 'Impostor Wins'}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="card px-4 sm:px-8 py-4 mb-6 sm:mb-10 text-center w-full max-w-md mx-4"
      >
        <p className="text-secondary">{result?.reason}</p>
      </motion.div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <p className="section-header text-center mb-6">Role Reveal</p>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl px-4">
          {result?.players?.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`card p-5 text-center ${player.role === 'impostor' ? 'border-danger' : ''}`}
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full mb-2 sm:mb-3 flex items-center justify-center text-lg sm:text-xl font-semibold text-white"
                style={{ backgroundColor: player.color }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <p className="font-medium text-sm mb-2">{player.name}</p>
              <span className={`badge ${player.role === 'impostor' ? 'badge-danger' : 'badge-success'}`}>
                {player.role === 'impostor' ? 'Impostor' : 'Engineer'}
              </span>
              {player.id === currentPlayer?.id && <span className="block text-xs text-muted mt-2">(You)</span>}
              {!player.isAlive && <span className="block text-xs text-danger mt-1">Ejected</span>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onPlayAgain}
        className="btn btn-primary"
      >
        Play Again
      </motion.button>
    </motion.div>
  )
}
