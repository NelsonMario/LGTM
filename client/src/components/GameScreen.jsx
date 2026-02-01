import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import Chat from './Chat'
import Icon from './Icon'
import { runTests } from '../utils/codeRunner'

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
  onSendMessage,
  theme,
  onToggleTheme
}) {
  const [showMeetingConfirm, setShowMeetingConfirm] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [editorTheme, setEditorTheme] = useState('light')
  const editorRef = useRef(null)

  // Sync editor theme with document theme
  useEffect(() => {
    const updateTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme')
      setEditorTheme(theme === 'dark' ? 'vs-dark' : 'light')
    }
    updateTheme()
    
    // Watch for theme changes
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    
    return () => observer.disconnect()
  }, [])

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
    
    setTimeout(() => {
      const results = runTests(code, task.functionName, task.testCases)
      setTestResults(results)
      setIsRunning(false)
    }, 300)
  }

  const handleSubmitClick = () => {
    if (!task) return
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
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <div className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`badge ${role === 'engineer' ? 'badge-success' : 'badge-danger'}`}>
            {role === 'engineer' ? 'Engineer' : 'Impostor'}
          </span>
          <span className="text-secondary text-sm hidden sm:block">
            {role === 'engineer' ? 'Complete the task' : 'Sabotage secretly'}
          </span>
        </div>

        <div className={`timer ${isTimeWarning ? 'warning' : ''}`}>
          {formatTime(timeRemaining)}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleRunTests} 
            disabled={isRunning}
            className="btn btn-secondary text-sm"
          >
            <Icon name="play" size={14} />
            {isRunning ? '...' : 'Run'}
          </button>
          <button onClick={handleSubmitClick} className="btn btn-success text-sm">
            <Icon name="check" size={14} />
            Submit
          </button>
          <button onClick={() => setShowMeetingConfirm(true)} className="btn btn-danger text-sm">
            <Icon name="alert" size={14} />
            Meeting
          </button>
          <button
            onClick={onToggleTheme}
            className="btn btn-ghost p-2"
            aria-label="Toggle theme"
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-72 bg-surface border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="section-header">Objective</p>
            <h4 className="font-semibold text-sm mb-2">{task?.title}</h4>
            <p className="text-secondary text-xs leading-relaxed">{task?.description}</p>
          </div>

          {/* Test Cases */}
          <div className="p-4 border-b border-border">
            <p className="section-header">Test Cases</p>
            <div className="space-y-1.5">
              {task?.testCases?.map((tc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-mono">
                  {testResults?.results?.[idx] ? (
                    <span className={`w-4 h-4 flex items-center justify-center ${testResults.results[idx].passed ? 'test-pass' : 'test-fail'}`}>
                      <Icon name={testResults.results[idx].passed ? 'check' : 'x'} size={12} />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-current text-muted" />
                  )}
                  <span className="text-secondary truncate">
                    {task.functionName}({JSON.stringify(tc.input).slice(0, 15)}) → {JSON.stringify(tc.expected)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="p-4 border-b border-border">
            <p className="section-header">Players</p>
            <div className="space-y-2">
              {players.map((player) => (
                <div 
                  key={player.id}
                  className={`flex items-center gap-2 ${!player.isAlive ? 'opacity-40' : ''}`}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm flex-1 truncate">{player.name}</span>
                  {player.id === currentPlayer?.id && <span className="text-xs text-muted">(you)</span>}
                  {lastEditor?.id === player.id && <span className="text-xs text-warning">typing</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <Chat messages={chatMessages} onSendMessage={onSendMessage} currentPlayer={currentPlayer} />
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col bg-surface">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">solution.js</span>
            {lastEditor && (
              <span className="text-xs text-muted">
                Last edit: <span style={{ color: players.find(p => p.id === lastEditor.id)?.color }}>{lastEditor.name}</span>
              </span>
            )}
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme={editorTheme}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, SF Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                padding: { top: 16 },
                renderLineHighlight: 'none',
                overviewRulerBorder: false,
              }}
            />
          </div>

          {/* Test Output */}
          <AnimatePresence>
            {testResults && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border bg-background"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-medium text-sm flex items-center gap-1.5 ${testResults.passed ? 'test-pass' : 'test-fail'}`}>
                      <Icon name={testResults.passed ? 'check' : 'x'} size={14} />
                      {testResults.passed ? 'All tests passed' : 'Tests failed'}
                    </span>
                    <button onClick={() => setTestResults(null)} className="btn-ghost text-xs">
                      Close
                    </button>
                  </div>
                  {testResults.error && !testResults.results?.length && (
                    <p className="test-fail text-sm">{testResults.error}</p>
                  )}
                  <div className="space-y-1 text-xs font-mono">
                    {testResults.results?.map((result, idx) => (
                      <div key={idx} className={`flex items-center gap-1.5 ${result.passed ? 'test-pass' : 'test-fail'}`}>
                        <Icon name={result.passed ? 'check' : 'x'} size={12} />
                        <span>{task.functionName}({JSON.stringify(result.input)}) = {JSON.stringify(result.actual)}</span>
                        {!result.passed && <span className="text-muted"> (expected {JSON.stringify(result.expected)})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="modal-content">
              <h3 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${testResults?.passed ? 'test-pass' : 'test-fail'}`}>
                <Icon name={testResults?.passed ? 'check' : 'x'} size={20} />
                {testResults?.passed ? 'Ready to Submit' : 'Tests Failed'}
              </h3>
              
              <div className="mb-6 p-4 bg-background rounded-lg max-h-40 overflow-y-auto">
                {testResults?.results?.map((result, idx) => (
                  <div key={idx} className={`text-sm font-mono flex items-center gap-1.5 ${result.passed ? 'test-pass' : 'test-fail'}`}>
                    <Icon name={result.passed ? 'check' : 'x'} size={12} />
                    Test {idx + 1}
                  </div>
                ))}
              </div>

              <p className="text-secondary text-sm mb-6">
                {testResults?.passed 
                  ? 'All tests passed! Submit to win the game?' 
                  : 'Fix the failing tests before submitting.'}
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitModal(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                {testResults?.passed && (
                  <button onClick={confirmSubmit} className="btn btn-success flex-1">
                    Submit & Win
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
            className="modal-overlay"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="modal-content text-center">
              <h3 className="text-xl font-semibold mb-2">Emergency Meeting</h3>
              <p className="text-secondary text-sm mb-6">This will pause coding and start a vote.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowMeetingConfirm(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={confirmMeeting} className="btn btn-danger flex-1">
                  Call Meeting
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default GameScreen
