import { useState, useRef, useLayoutEffect } from 'react'

export interface TerminalInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
}

export default function TerminalInput({ value, onChange, className = '', ...rest }: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mirrorRef = useRef<HTMLSpanElement>(null)
  const [selectionStart, setSelectionStart] = useState(0)
  const [cursorLeft, setCursorLeft] = useState(0)
  const [isFocused, setIsFocused] = useState(false)

  const syncSelection = () => {
    const input = inputRef.current
    if (input) setSelectionStart(input.selectionStart ?? 0)
  }

  useLayoutEffect(() => {
    const mirror = mirrorRef.current
    const input = inputRef.current
    if (!mirror || !input) return
    const text = value.slice(0, selectionStart)
    mirror.textContent = text || ''
    const width = mirror.getBoundingClientRect().width
    setCursorLeft(width)
  }, [value, selectionStart])

  return (
    <span className="terminal-input-wrapper">
      <span ref={mirrorRef} className={`terminal-input-mirror ${className}`.trim()} aria-hidden />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setSelectionStart(e.target.selectionStart ?? 0)
        }}
        onSelect={syncSelection}
        onKeyUp={syncSelection}
        onClick={syncSelection}
        onFocus={() => {
          setIsFocused(true)
          setTimeout(syncSelection, 0)
        }}
        onBlur={() => setIsFocused(false)}
        className={`terminal-input ${className}`.trim()}
        {...rest}
      />
      {isFocused && (
        <span
          className="terminal-block-cursor"
          style={{ left: cursorLeft }}
          aria-hidden
        >
          █
        </span>
      )}
    </span>
  )
}
