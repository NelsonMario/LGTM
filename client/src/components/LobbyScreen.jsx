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
      className="min-h-screen flex flex-col items-center justify-center p-8"
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="font-display text-3xl text-terminal-green glow-text mb-2">LOBBY</h2>
        <p className="text-gray-400">Waiting for players...</p>
      </motion.div>

      {/* Room Code */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="terminal-panel p-6 mb-8 text-center cursor-pointer hover:border-terminal-green transition-all"
        onClick={copyRoomCode}
      >
        <p className="text-gray-400 text-sm mb-2">ROOM CODE (click to copy)</p>
        <p className="font-display text-4xl text-terminal-green tracking-[0.5em] glow-text">
          {roomCode}
        </p>
      </motion.div>

      {/* Players Grid */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-2 gap-4 mb-8 w-full max-w-lg"
      >
        {[0, 1, 2, 3].map((index) => {
          const player = players[index]
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={`terminal-panel p-4 text-center ${
                player ? 'border-terminal-green/50' : 'border-gray-700 border-dashed'
              }`}
            >
              {player ? (
                <>
                  <div 
                    className="w-16 h-16 mx-auto rounded-full mb-3 flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: player.color + '30', borderColor: player.color, borderWidth: 2 }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-white font-medium truncate">{player.name}</p>
                  {index === 0 && <span className="text-xs text-terminal-yellow mt-1 block">HOST</span>}
                  {player.id === currentPlayer?.id && <span className="text-xs text-terminal-green mt-1 block">(YOU)</span>}
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto rounded-full mb-3 border-2 border-dashed border-gray-600 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl">?</span>
                  </div>
                  <p className="text-gray-600">Waiting...</p>
                </>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Player count */}
      <div className="text-center mb-6">
        <span className={`text-2xl font-display ${canStart ? 'text-terminal-green' : 'text-terminal-yellow'}`}>
          {players.length}/4
        </span>
        <span className="text-gray-400 ml-2">players</span>
      </div>

      {/* Start button */}
      {isHost ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onStartGame}
          disabled={!canStart}
          className="cyber-button"
        >
          {canStart ? 'START GAME' : 'NEED 4 PLAYERS'}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400">
          Waiting for host to start...
        </motion.div>
      )}

      {/* Rules */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 terminal-panel p-6 max-w-lg"
      >
        <h3 className="font-display text-terminal-green mb-4">GAME RULES</h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-terminal-green">▸</span>
            <span>3 Engineers, 1 Impostor - roles assigned randomly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-terminal-green">▸</span>
            <span>Engineers must complete the coding task together</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-terminal-red">▸</span>
            <span>The Impostor must secretly sabotage the code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-terminal-yellow">▸</span>
            <span>Call a meeting if you suspect someone - vote to eject!</span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  )
}

export default LobbyScreen
