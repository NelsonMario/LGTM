import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { Chat } from '@/components/chat'
import { Icon } from '@/components/ui'
import { runTests } from '@/lib/codeRunner'
import type { Task, Player, ChatMessage, TestRunResult, Theme } from '@/types'

interface GameScreenProps {
  role: string | null
  task: Task | null
  code: string
  onCodeChange: (code: string) => void
  timeRemaining: number
  players: Player[]
  currentPlayer: Player | null
  lastEditor: { name: string; id: string } | null
  onCallMeeting: () => void
  onSubmitTask: (passed?: boolean) => void
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

export default function GameScreen({
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
  onToggleTheme,
}: GameScreenProps) {
  const [showMeetingConfirm, setShowMeetingConfirm] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [testResults, setTestResults] = useState<TestRunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('light')
  const [testCasesExpanded, setTestCasesExpanded] = useState(true)
  const [hoveredTestCase, setHoveredTestCase] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const editorRef = useRef<unknown>(null)

  useEffect(() => {
    const updateTheme = () => {
      setEditorTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'light')
    }
    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const handleRunTests = () => {
    if (!task) return
    setIsRunning(true)
    setTimeout(() => {
      setTestResults(runTests(code, task.functionName, task.testCases))
      setIsRunning(false)
    }, 300)
  }

  const handleSubmitClick = () => {
    if (!task) return
    setTestResults(runTests(code, task.functionName, task.testCases))
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
      <div className="bg-surface border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <span className={`badge text-xs ${role === 'engineer' ? 'badge-success' : 'badge-danger'}`}>
            {role === 'engineer' ? 'Engineer' : 'Impostor'}
          </span>
          <span className="text-secondary text-xs sm:text-sm hidden sm:block">
            {role === 'engineer' ? 'Complete the task' : 'Sabotage secretly'}
          </span>
        </div>
        <div className={`timer text-lg sm:text-xl md:text-2xl ${isTimeWarning ? 'warning' : ''}`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3"
          >
            <Icon name="play" size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{isRunning ? '...' : 'Run'}</span>
          </button>
          <button onClick={handleSubmitClick} className="btn btn-success text-xs sm:text-sm px-2 sm:px-3">
            <Icon name="check" size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
          <button onClick={() => setShowMeetingConfirm(true)} className="btn btn-danger text-xs sm:text-sm px-2 sm:px-3">
            <Icon name="alert" size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Meeting</span>
          </button>
          <button onClick={onToggleTheme} className="btn btn-ghost p-1.5 sm:p-2" aria-label="Toggle theme">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-72 bg-surface border-r-0 lg:border-r border-b lg:border-b-0 border-border flex flex-col shrink-0 max-h-64 lg:max-h-none overflow-y-auto">
          <div className="p-3 sm:p-4 border-b border-border">
            <p className="section-header text-xs">Objective</p>
            <h4 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">{task?.title}</h4>
            <p className="text-secondary text-xs leading-relaxed">{task?.description}</p>
          </div>

          <div className="border-b border-border">
            <button
              onClick={() => setTestCasesExpanded(!testCasesExpanded)}
              className="w-full p-4 flex items-center justify-between hover:bg-background transition-colors"
            >
              <p className="section-header">Test Cases</p>
              <Icon name={testCasesExpanded ? 'x' : 'plus'} size={14} className="text-muted" />
            </button>
            {testCasesExpanded && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 max-h-64 overflow-y-auto">
                {task?.testCases?.map((tc, idx) => {
                  const fullText = `${task.functionName}(${JSON.stringify(tc.input)}) → ${JSON.stringify(tc.expected)}`
                  const truncatedText = `${task.functionName}(${JSON.stringify(tc.input).slice(0, 20)}...) → ${JSON.stringify(tc.expected).slice(0, 20)}${JSON.stringify(tc.expected).length > 20 ? '...' : ''}`
                  const isTruncated = fullText.length > 60
                  return (
                    <div
                      key={idx}
                      className="relative flex items-start gap-2 text-xs font-mono group"
                      onMouseEnter={(e: React.MouseEvent) => {
                        setHoveredTestCase(idx)
                        setTooltipPosition({ x: e.clientX, y: e.clientY })
                      }}
                      onMouseMove={(e: React.MouseEvent) => {
                        if (hoveredTestCase === idx) setTooltipPosition({ x: e.clientX, y: e.clientY })
                      }}
                      onMouseLeave={() => setHoveredTestCase(null)}
                    >
                      {testResults?.results?.[idx] ? (
                        <span
                          className={`w-4 h-4 flex items-center justify-center shrink-0 mt-0.5 ${testResults.results[idx].passed ? 'test-pass' : 'test-fail'}`}
                        >
                          <Icon name={testResults.results[idx].passed ? 'check' : 'x'} size={12} />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-current text-muted shrink-0 mt-0.5" />
                      )}
                      <span className="text-secondary break-words min-w-0 flex-1">
                        {isTruncated ? truncatedText : fullText}
                      </span>
                      {hoveredTestCase === idx && isTruncated && (
                        <div
                          className="fixed z-[9999] p-3 bg-surface border border-border rounded-lg shadow-2xl text-xs font-mono max-w-md break-words pointer-events-none"
                          style={{
                            left: `${tooltipPosition.x + 10}px`,
                            top: `${tooltipPosition.y + 10}px`,
                            maxWidth: '400px',
                          }}
                        >
                          <div className="text-primary font-semibold mb-2">Test {idx + 1}</div>
                          <div className="text-secondary mb-1">
                            <span className="text-muted">Input:</span>{' '}
                            <span className="text-primary font-mono ml-1">{JSON.stringify(tc.input)}</span>
                          </div>
                          <div className="text-secondary mb-1">
                            <span className="text-muted">Expected:</span>{' '}
                            <span className="text-primary font-mono ml-1">{JSON.stringify(tc.expected)}</span>
                          </div>
                          {testResults?.results?.[idx] && (
                            <div
                              className={`mt-2 pt-2 border-t border-border ${testResults.results[idx].passed ? 'test-pass' : 'test-fail'}`}
                            >
                              <span className="text-muted">Actual:</span>{' '}
                              <span className="font-mono ml-1">
                                {JSON.stringify(testResults.results[idx].actual)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-b border-border">
            <p className="section-header text-xs">Players</p>
            <div className="space-y-2">
              {players.map((player) => (
                <div key={player.id} className={`flex items-center gap-2 ${!player.isAlive ? 'opacity-40' : ''}`}>
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

          <div className="flex-1 flex flex-col min-h-0">
            <Chat messages={chatMessages} onSendMessage={onSendMessage} currentPlayer={currentPlayer} />
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-surface min-h-0">
          <div className="px-3 sm:px-4 py-2 border-b border-border flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium truncate">solution.js</span>
            {lastEditor && (
              <span className="text-xs text-muted shrink-0 hidden sm:inline">
                Last edit:{' '}
                <span style={{ color: players.find((p) => p.id === lastEditor.id)?.color ?? undefined }}>
                  {lastEditor.name}
                </span>
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme={editorTheme}
              value={code}
              onChange={(value) => onCodeChange(value ?? '')}
              onMount={(editor) => { editorRef.current = editor }}
              options={{
                fontSize: 11,
                fontFamily: 'JetBrains Mono, SF Mono, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                padding: { top: 12 },
                renderLineHighlight: 'none',
                overviewRulerBorder: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

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
                    <span
                      className={`font-medium text-sm flex items-center gap-1.5 ${testResults.passed ? 'test-pass' : 'test-fail'}`}
                    >
                      <Icon name={testResults.passed ? 'check' : 'x'} size={14} />
                      {testResults.passed ? 'All tests passed' : 'Tests failed'}
                    </span>
                    <button onClick={() => setTestResults(null)} className="btn-ghost text-xs">Close</button>
                  </div>
                  {testResults.error && !testResults.results?.length && (
                    <p className="test-fail text-sm">{testResults.error}</p>
                  )}
                  <div className="space-y-1 text-xs font-mono">
                    {testResults.results?.map((result, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 ${result.passed ? 'test-pass' : 'test-fail'}`}
                      >
                        <Icon name={result.passed ? 'check' : 'x'} size={12} />
                        <span>
                          {task?.functionName}({JSON.stringify(result.input)}) = {JSON.stringify(result.actual)}
                        </span>
                        {!result.passed && (
                          <span className="text-muted"> (expected {JSON.stringify(result.expected)})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showSubmitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="modal-content max-w-[90vw] sm:max-w-md">
              <h3
                className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${testResults?.passed ? 'test-pass' : 'test-fail'}`}
              >
                <Icon name={testResults?.passed ? 'check' : 'x'} size={18} className="sm:w-5 sm:h-5" />
                {testResults?.passed ? 'Ready to Submit' : 'Tests Failed'}
              </h3>
              <div className="mb-6 p-4 bg-background rounded-lg max-h-40 overflow-y-auto">
                {testResults?.results?.map((result, idx) => (
                  <div
                    key={idx}
                    className={`text-sm font-mono flex items-center gap-1.5 ${result.passed ? 'test-pass' : 'test-fail'}`}
                  >
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

      <AnimatePresence>
        {showMeetingConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
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
