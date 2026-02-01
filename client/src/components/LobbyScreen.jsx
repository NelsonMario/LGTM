import { motion } from 'framer-motion'

function LobbyScreen({ roomCode, players, currentPlayer, onStartGame }) {
  const isHost = players[0]?.id === currentPlayer?.id
  const canStart = players.length >= 4

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 dot-pattern"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-semibold text-primary mb-1">Waiting Room</h2>
        <p className="text-secondary text-sm">Waiting for players to join...</p>
      </motion.div>

      {/* Room Code */}
      <motion.button
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={copyRoomCode}
        className="card px-8 py-5 mb-8 text-center hover:shadow-soft cursor-pointer group"
      >
        <p className="section-header">Room Code (click to copy)</p>
        <p className="font-mono text-2xl sm:text-3xl font-bold tracking-[0.2em] sm:tracking-[0.3em] text-primary group-hover:text-secondary transition-colors">
          {roomCode}
        </p>
      </motion.button>

      {/* Players Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8 w-full max-w-md"
      >
        {[0, 1, 2, 3].map((index) => {
          const player = players[index]
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`card p-5 text-center ${!player ? 'border-dashed' : ''}`}
            >
              {player ? (
                <>
                  <div 
                    className="w-12 h-12 mx-auto rounded-full mb-3 flex items-center justify-center text-lg font-semibold text-white"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-sm truncate">{player.name}</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {index === 0 && <span className="badge text-xs">Host</span>}
                    {player.id === currentPlayer?.id && <span className="badge badge-success text-xs">You</span>}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 mx-auto rounded-full mb-3 border-2 border-dashed border-border flex items-center justify-center">
                    <span className="text-muted text-lg">?</span>
                  </div>
                  <p className="text-muted text-sm">Waiting...</p>
                </>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Player count */}
      <div className="text-center mb-6">
        <span className={`text-2xl font-semibold ${canStart ? 'text-success' : 'text-warning'}`}>
          {players.length}/4
        </span>
        <span className="text-secondary ml-2 text-sm">players</span>
      </div>

      {/* Start button */}
      {isHost ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onStartGame}
          disabled={!canStart}
          className={`btn ${canStart ? 'btn-primary' : 'btn-secondary'}`}
        >
          {canStart ? 'Start Game' : 'Need 4 Players'}
        </motion.button>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-secondary text-sm"
        >
          Waiting for host to start...
        </motion.p>
      )}

      {/* Rules */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 sm:mt-10 card p-4 sm:p-6 max-w-md w-full px-4"
      >
        <p className="section-header">Game Rules</p>
        <ul className="text-sm text-secondary space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>3 Engineers, 1 Impostor - roles assigned randomly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Engineers must complete the coding task together</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-danger">•</span>
            <span>The Impostor must secretly sabotage the code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warning">•</span>
            <span>Call a meeting if you suspect someone - vote to eject!</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  )
}

export default LobbyScreen
