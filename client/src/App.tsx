import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/ui'
import { Threads } from '@/components/background'
import { HomeScreen, LobbyScreen, GameScreen, VotingScreen, ResultScreen } from '@/components/screens'
import { useTheme } from '@/hooks/useTheme'
import { useGameSocket } from '@/hooks/useGameSocket'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const {
    gameState,
    player,
    players,
    roomCode,
    role,
    task,
    code,
    timeRemaining,
    lastEditor,
    editHistory,
    meetingCaller,
    votingTimeRemaining,
    gameResult,
    error,
    chatMessages,
    createRoom,
    joinRoom,
    startGame,
    updateCode,
    callMeeting,
    submitTask,
    castVote,
    sendChatMessage,
    resetGame,
  } = useGameSocket()

  const showThemeToggle =
    gameState === 'home' || gameState === 'lobby' || gameState === 'ended'

  const threadsColor: [number, number, number] =
    theme === 'dark' ? [0.88, 0.95, 0.92] : [1, 1, 1]

  return (
    <div className="min-h-screen bg-background relative">
      {showThemeToggle && (
        <div className="fixed inset-0 z-0">
          <Threads
            amplitude={1}
            distance={0}
            enableMouseInteraction
            color={threadsColor}
            className="w-full h-full"
          />
        </div>
      )}
      <div className="relative z-10 min-h-screen flex flex-col pointer-events-none">
      {showThemeToggle && (
        <button
          onClick={toggleTheme}
          className="theme-toggle fixed top-2 right-2 sm:top-4 sm:right-4 z-40 pointer-events-auto"
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      )}

      <div className="flex-1 flex flex-col pointer-events-auto">
      <AnimatePresence>
        {error && (
          <div className="fixed top-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="pointer-events-auto bg-danger/10 border border-danger text-danger px-6 py-3 rounded-xl shadow-medium"
            >
              {error}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {gameState === 'home' && (
          <HomeScreen key="home" onCreateRoom={createRoom} onJoinRoom={joinRoom} />
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
      </div>
    </div>
  )
}
