import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import Chat from './Chat'
import { runTests, formatTestResults } from '../utils/codeRunner'

function GameScreen({ 
  role, 
  task, 
  code, 
  onCodeChange, 
  timeRemaining, 
  players, 
  currentPlayer,
  lastEditor,
  onCallMeeting,
  onSubmitTask,
  chatMessages,
  onSendMessage
}) {
  const [showMeetingConfirm, setShowMeetingConfirm] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const editorRef = useRef(null)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEditorChange = (value) => {
    onCodeChange(value)
  }

  const handleEditorMount = (editor) => {
    editorRef.current = editor
  }

  const handleRunTests = () => {
    if (!task) return
    setIsRunning(true)
    
    // Small delay for UX
    setTimeout(() => {
      const results = runTests(code, task.functionName, task.testCases)
      setTestResults(results)
      setIsRunning(false)
    }, 300)
  }

  const handleSubmitClick = () => {
    if (!task) return
    
    // Run tests first
    const results = runTests(code, task.functionName, task.testCases)
    setTestResults(results)
    setShowSubmitModal(true)
  }

  const confirmSubmit = () => {
    if (testResults?.passed) {
      setShowSubmitModal(false)
      onSubmitTask()
    }
  }

  const confirmMeeting = () => {
    setShowMeetingConfirm(false)
    onCallMeeting()
  }

  const isTimeWarning = timeRemaining <= 30

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      {/* Header */}
      <div className="bg-panel-bg border-b border-panel-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={`role-badge ${role}`}>
            {role === 'engineer' ? '🔧 Engineer' : '🔪 Impostor'}
          </span>
          <span className="text-gray-400 text-sm">
            {role === 'engineer' ? 'Complete the task!' : 'Sabotage secretly...'}
          </span>
        </div>

        <div className={`timer ${isTimeWarning ? 'warning' : ''}`}>
          {formatTime(timeRemaining)}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleRunTests} 
            disabled={isRunning}
            className="cyber-button text-sm py-2 px-4"
          >
            {isRunning ? '⏳ Running...' : '▶️ RUN TESTS'}
          </button>
          <button onClick={handleSubmitClick} className="cyber-button text-sm py-2 px-4">
            ✅ SUBMIT
          </button>
          <button onClick={() => setShowMeetingConfirm(true)} className="cyber-button danger text-sm py-2 px-4">
            🚨 MEETING
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="w-80 bg-panel-bg border-r border-panel-border flex flex-col">
          <div className="p-4 border-b border-panel-border">
            <h3 className="font-display text-terminal-green text-sm mb-2">OBJECTIVE</h3>
            <h4 className="text-white font-bold mb-2">{task?.title}</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{task?.description}</p>
          </div>

          {/* Test Cases */}
          <div className="p-4 border-b border-panel-border">
            <h3 className="font-display text-terminal-green text-sm mb-3">TEST CASES</h3>
            <div className="space-y-2 text-xs">
              {task?.testCases?.map((tc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {testResults?.results?.[idx] ? (
                    <span className={testResults.results[idx].passed ? 'text-terminal-green' : 'text-terminal-red'}>
                      {testResults.results[idx].passed ? '✅' : '❌'}
                    </span>
                  ) : (
                    <span className="text-gray-500">⬜</span>
                  )}
                  <span className="text-gray-400">
                    {task.functionName}({JSON.stringify(tc.input)}) → {JSON.stringify(tc.expected)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="p-4 border-b border-panel-border">
            <h3 className="font-display text-terminal-green text-sm mb-3">PLAYERS</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div 
                  key={player.id}
                  className={`player-card flex items-center gap-3 ${!player.isAlive ? 'dead' : ''}`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: player.color + '30', color: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate">{player.name}</span>
                  {player.id === currentPlayer?.id && <span className="text-xs text-terminal-green">(YOU)</span>}
                  {lastEditor?.id === player.id && <span className="text-xs text-terminal-yellow animate-pulse">typing...</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <Chat messages={chatMessages} onSendMessage={onSendMessage} currentPlayer={currentPlayer} />
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-[#1e1e1e] px-4 py-2 border-b border-gray-800 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-terminal-red" />
              <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
              <div className="w-3 h-3 rounded-full bg-terminal-green" />
            </div>
            <span className="text-gray-400 text-sm ml-2">solution.js</span>
            {lastEditor && (
              <span className="text-gray-500 text-xs ml-auto">
                Last edit by: <span style={{ color: players.find(p => p.id === lastEditor.id)?.color }}>{lastEditor.name}</span>
              </span>
            )}
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                padding: { top: 16 }
              }}
            />
          </div>

          {/* Test Output Console */}
          <AnimatePresence>
            {testResults && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#0d0d0d] border-t border-gray-800"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-display text-sm ${testResults.passed ? 'text-terminal-green' : 'text-terminal-red'}`}>
                      {testResults.passed ? '✅ ALL TESTS PASSED!' : '❌ TESTS FAILED'}
                    </h4>
                    <button 
                      onClick={() => setTestResults(null)}
                      className="text-gray-500 hover:text-white text-sm"
                    >
                      ✕ Close
                    </button>
                  </div>
                  {testResults.error && (
                    <p className="text-terminal-red text-sm mb-2">{testResults.error}</p>
                  )}
                  <div className="space-y-1 text-xs font-mono">
                    {testResults.results?.map((result, idx) => (
                      <div key={idx} className={result.passed ? 'text-terminal-green' : 'text-terminal-red'}>
                        {result.passed ? '✓' : '✗'} Test {idx + 1}: 
                        {task.functionName}({JSON.stringify(result.input)}) 
                        {result.passed 
                          ? ` = ${JSON.stringify(result.actual)}` 
                          : ` expected ${JSON.stringify(result.expected)}, got ${result.error || JSON.stringify(result.actual)}`
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Role tip */}
      <div className={`px-6 py-2 text-center text-sm ${role === 'impostor' ? 'bg-terminal-red/10 text-terminal-red' : 'bg-terminal-green/10 text-terminal-green'}`}>
        {role === 'engineer' 
          ? '💡 Tip: Click "RUN TESTS" to check your code. Watch for suspicious edits!'
          : '💀 Tip: Be subtle! Add small bugs that break tests without being obvious.'}
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9 }} 
              animate={{ scale: 1 }} 
              className="terminal-panel p-8 max-w-lg"
            >
              <h3 className={`font-display text-2xl mb-4 text-center ${testResults?.passed ? 'text-terminal-green' : 'text-terminal-red'}`}>
                {testResults?.passed ? '✅ READY TO SUBMIT!' : '❌ TESTS FAILED'}
              </h3>
              
              <div className="mb-6 p-4 bg-black/50 rounded max-h-48 overflow-y-auto">
                {testResults?.error && !testResults.results?.length && (
                  <p className="text-terminal-red text-sm">{testResults.error}</p>
                )}
                {testResults?.results?.map((result, idx) => (
                  <div key={idx} className={`text-sm ${result.passed ? 'text-terminal-green' : 'text-terminal-red'}`}>
                    {result.passed ? '✓' : '✗'} Test {idx + 1}: {JSON.stringify(result.input)} → {JSON.stringify(result.actual)}
                    {!result.passed && result.error && <span className="text-gray-400"> ({result.error})</span>}
                  </div>
                ))}
              </div>

              {testResults?.passed ? (
                <p className="text-gray-400 mb-6 text-center">All tests passed! Submit to win the game?</p>
              ) : (
                <p className="text-gray-400 mb-6 text-center">Fix the failing tests before submitting.</p>
              )}
              
              <div className="flex gap-4 justify-center">
                <button onClick={() => setShowSubmitModal(false)} className="cyber-button">
                  {testResults?.passed ? 'Cancel' : 'Back to Code'}
                </button>
                {testResults?.passed && (
                  <button onClick={confirmSubmit} className="cyber-button">
                    🏆 Submit & Win!
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meeting Modal */}
      <AnimatePresence>
        {showMeetingConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="terminal-panel p-8 max-w-md text-center">
              <h3 className="font-display text-2xl text-terminal-red mb-4">🚨 EMERGENCY MEETING</h3>
              <p className="text-gray-400 mb-6">Are you sure? This will pause coding and start a vote.</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setShowMeetingConfirm(false)} className="cyber-button">Cancel</button>
                <button onClick={confirmMeeting} className="cyber-button danger">Call Meeting</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default GameScreen
