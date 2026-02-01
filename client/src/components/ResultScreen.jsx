import { motion } from 'framer-motion'

function ResultScreen({ result, currentPlayer, onPlayAgain }) {
  const isEngineerWin = result?.winner === 'engineers'
  const currentPlayerRole = result?.players?.find(p => p.id === currentPlayer?.id)?.role
  const didWin = (isEngineerWin && currentPlayerRole === 'engineer') || 
                 (!isEngineerWin && currentPlayerRole === 'impostor')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-8"
    >
      {/* Victory/Defeat Banner */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className={`font-display text-6xl md:text-8xl font-black mb-4 ${
          didWin ? 'text-terminal-green glow-text' : 'text-terminal-red glow-text-red'
        }`}>
          {didWin ? 'VICTORY!' : 'DEFEAT!'}
        </h1>
        <p className="text-2xl text-gray-400">
          {isEngineerWin ? '🔧 Engineers Win!' : '🔪 Impostor Wins!'}
        </p>
      </motion.div>

      {/* Reason */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="terminal-panel p-6 mb-8 text-center max-w-md"
      >
        <p className="text-gray-400 text-lg">{result?.reason}</p>
      </motion.div>

      {/* Reveal Players */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h3 className="font-display text-terminal-green text-center mb-6">ROLE REVEAL</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {result?.players?.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`terminal-panel p-4 text-center ${player.role === 'impostor' ? 'border-terminal-red' : ''}`}
            >
              <div 
                className="w-16 h-16 mx-auto rounded-full mb-3 flex items-center justify-center text-2xl font-bold"
                style={{ 
                  backgroundColor: player.color + '30', 
                  borderColor: player.role === 'impostor' ? '#ff4757' : player.color, 
                  borderWidth: 2 
                }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-medium mb-2">{player.name}</p>
              <span className={`role-badge ${player.role}`}>
                {player.role === 'impostor' ? '🔪 IMPOSTOR' : '🔧 Engineer'}
              </span>
              {player.id === currentPlayer?.id && <span className="block text-xs text-gray-500 mt-2">(You)</span>}
              {!player.isAlive && <span className="block text-xs text-terminal-red mt-1">☠️ Ejected</span>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Play Again */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={onPlayAgain}
        className="cyber-button"
      >
        PLAY AGAIN
      </motion.button>

      {/* Decorative particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -20, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000) }}
            animate={{ 
              opacity: [0, 1, 0],
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 1000,
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity
            }}
            className={`absolute w-2 h-2 rounded-full ${isEngineerWin ? 'bg-terminal-green' : 'bg-terminal-red'}`}
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default ResultScreen
