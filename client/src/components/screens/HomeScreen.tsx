import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Icon, TypeWriter, TerminalInput } from '@/components/ui'

interface HomeScreenProps {
  onCreateRoom: (name: string) => void
  onJoinRoom: (roomCode: string, name: string) => void
}

export default function HomeScreen({ onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [joinStep, setJoinStep] = useState<'code' | 'name'>('code')
  const [focusedOption, setFocusedOption] = useState<0 | 1>(0)

  const handleCreate = () => {
    if (playerName.trim()) onCreateRoom(playerName.trim())
  }

  const handleJoin = () => {
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim())
    }
  }


  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if (mode === 'menu' && !inInput) {
        if (e.key === '1' || e.key === 'c' || e.key === 'C') {
          e.preventDefault()
          setMode('create')
          setFocusedOption(0)
        } else if (e.key === '2' || e.key === 'j' || e.key === 'J') {
          e.preventDefault()
          setMode('join')
          setFocusedOption(1)
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault()
          setFocusedOption((prev) => (prev === 0 ? 1 : 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (focusedOption === 0) setMode('create')
          else setMode('join')
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setMode('menu')
        setJoinStep('code')
      } else if (mode === 'create' && e.key === 'Enter') {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' && (target as HTMLInputElement).name === 'create-name') {
          e.preventDefault()
          handleCreate()
        }
      } else if (mode === 'join' && e.key === 'Enter') {
        const target = e.target as HTMLInputElement
        if (target.tagName !== 'INPUT') return
        if (target.name === 'join-code' && roomCode.trim()) {
          e.preventDefault()
          setJoinStep('name')
        } else if (target.name === 'join-name') {
          e.preventDefault()
          handleJoin()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, focusedOption, playerName, roomCode])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 dot-pattern"
    >
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="terminal-window w-full max-w-lg pointer-events-auto"
      >
        <div className="terminal-title-bar">
          <div className="terminal-title-bar-dots" aria-hidden>
            <span /><span /><span />
          </div>
          <span>lgtm — looks good to me ?</span>
        </div>
        <div className="terminal-body">
          <div className="text-base sm:text-lg mb-1">
            <span className="terminal-prompt">$ </span>
            <TypeWriter
              text="LGTM"
              prefix=""
              delay={300}
              speed={65}
              cursor={false}
              cursorStyle="block"
              cursorChar="█"
            />
          </div>
          <div className="text-sm sm:text-base text-[var(--terminal-muted)] mb-6">
            <span className="terminal-prompt">$ </span>
            <TypeWriter
              text="pair programming"
              prefix=""
              delay={1200}
              speed={60}
              cursor
              cursorStyle="block"
              cursorChar="█"
            />
          </div>

          {mode === 'menu' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
              <p className="terminal-comment mb-3"># type 1 or 2, or use ↑/↓ and Enter</p>
              <button
                type="button"
                onClick={() => setMode('create')}
                onFocus={() => setFocusedOption(0)}
                className={`terminal-line w-full text-left px-2 py-1.5 rounded ${focusedOption === 0 ? 'bg-white/10 text-[var(--terminal-text)]' : 'text-[var(--terminal-muted)] hover:bg-white/5'}`}
              >
                <span className="terminal-prompt">$</span> create
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                onFocus={() => setFocusedOption(1)}
                className={`terminal-line w-full text-left px-2 py-1.5 rounded ${focusedOption === 1 ? 'bg-white/10 text-[var(--terminal-text)]' : 'text-[var(--terminal-muted)] hover:bg-white/5'}`}
              >
                <span className="terminal-prompt">$</span> join
              </button>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
              <p><span className="terminal-prompt">$</span> create</p>
              <label className="terminal-input-line">
                <span className="terminal-prompt">name&gt;</span>
                <TerminalInput
                  name="create-name"
                  value={playerName}
                  onChange={setPlayerName}
                  maxLength={15}
                  autoFocus
                />
              </label>
              <p className="terminal-comment text-xs mt-1"># Enter to create · Esc to back</p>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => setMode('menu')} className="btn btn-secondary text-sm py-1.5">back</button>
                <button type="button" onClick={handleCreate} disabled={!playerName.trim()} className="btn btn-primary text-sm py-1.5">create</button>
              </div>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
              <p><span className="terminal-prompt">$</span> join</p>
              {joinStep === 'code' && (
                <label className="terminal-input-line">
                  <span className="terminal-prompt">code&gt;</span>
                  <TerminalInput
                    name="join-code"
                    value={roomCode}
                    onChange={(v) => setRoomCode(v.toUpperCase())}
                    className="font-mono tracking-wider"
                    autoFocus
                  />
                </label>
              )}
              {joinStep === 'name' && (
                <>
                  <p><span className="terminal-prompt">code&gt;</span>{' '}{roomCode.trim() || '—'}</p>
                  <label className="terminal-input-line">
                    <span className="terminal-prompt">name&gt;</span>
                    <TerminalInput
                      name="join-name"
                      value={playerName}
                      onChange={setPlayerName}
                      maxLength={15}
                      autoFocus
                    />
                  </label>
                </>
              )}
              <p className="terminal-comment text-xs mt-1">
                {joinStep === 'code' ? '# Enter room code, then Enter · Esc to back' : '# Enter your name, then Enter · Esc to back'}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setMode('menu'); setJoinStep('code') }}
                  className="btn btn-secondary text-sm py-1.5"
                >
                  back
                </button>
                {joinStep === 'name' && (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={!playerName.trim()}
                    className="btn btn-primary text-sm py-1.5"
                  >
                    join
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 sm:mt-12 max-w-lg text-center w-full px-4"
      >
        <p className="section-header mb-6">How to Play</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="card p-5 text-left">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <Icon name="check" size={16} className="text-success" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Engineers</h4>
            <p className="text-secondary text-xs leading-relaxed">
              Complete the coding task together. Watch for suspicious edits.
            </p>
          </div>
          <div className="card p-5 text-left">
            <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center mb-3">
              <Icon name="x" size={16} className="text-danger" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Impostor</h4>
            <p className="text-secondary text-xs leading-relaxed">
              Sabotage the code secretly without getting caught.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
