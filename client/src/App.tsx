import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/ui'
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

  return (
    <div className="min-h-screen bg-background">
      {showThemeToggle && (
        <button
          onClick={toggleTheme}
          className="theme-toggle fixed top-2 right-2 sm:top-4 sm:right-4 z-40"
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-danger/10 border border-danger text-danger px-6 py-3 rounded-xl shadow-medium"
          >
            {error}
          </motion.div>
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
  )
}
