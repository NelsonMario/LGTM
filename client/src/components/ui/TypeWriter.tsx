import { useState, useEffect } from 'react'

export interface TypeWriterProps {
  text: string
  delay?: number
  speed?: number
  prefix?: string
  cursor?: boolean
  cursorStyle?: 'underline' | 'block'
  cursorChar?: string
  loop?: boolean
  loopDelay?: number
  className?: string
  suffix?: React.ReactNode
}

export default function TypeWriter({
  text,
  delay = 0,
  speed = 80,
  prefix = '',
  cursor = true,
  cursorStyle = 'underline',
  cursorChar = '▌',
  loop = false,
  loopDelay = 2000,
  className = '',
  suffix,
}: TypeWriterProps) {
  const [display, setDisplay] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    if (!text) return

    let cancelled = false
    const timeoutIds: ReturnType<typeof setTimeout>[] = []

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!cancelled) fn()
      }, ms)
      timeoutIds.push(id)
    }

    const startTimeout = setTimeout(() => {
      if (cancelled) return
      let index = prefix.length
      setDisplay(prefix)

      const type = () => {
        if (cancelled) return
        if (index <= text.length) {
          setDisplay(prefix + text.slice(0, index))
          index++
          schedule(type, speed)
        } else {
          setIsComplete(true)
          if (loop) {
            schedule(() => {
              if (cancelled) return
              setIsComplete(false)
              setDisplay(prefix)
              index = prefix.length
              const restart = () => {
                if (cancelled) return
                if (index <= text.length) {
                  setDisplay(prefix + text.slice(0, index))
                  index++
                  schedule(restart, speed)
                } else {
                  setIsComplete(true)
                  schedule(() => {
                    if (cancelled) return
                    setIsComplete(false)
                    setDisplay(prefix)
                    index = prefix.length
                    restart()
                  }, loopDelay)
                }
              }
              schedule(restart, loopDelay)
            }, loopDelay)
          }
        }
      }

      schedule(type, 0)
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(startTimeout)
      timeoutIds.forEach(clearTimeout)
    }
  }, [text, prefix, delay, speed, loop, loopDelay])

  useEffect(() => {
    if (!cursor) return
    const id = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(id)
  }, [cursor])

  const showCursor = cursor && (!isComplete || loop)

  return (
    <span className={className}>
      {display}
      {isComplete && !loop && suffix}
      {showCursor &&
        (cursorStyle === 'underline' ? (
          <span
            className="inline-block w-[0.6em] h-[0.12em] min-w-[2px] align-baseline rounded-sm bg-current"
            style={{
              opacity: cursorVisible ? 1 : 0,
              marginLeft: '1px',
              verticalAlign: '0.2em',
            }}
            aria-hidden
          />
        ) : (
          <span
            className="inline-block w-[0.5em] text-current align-baseline"
            style={{ opacity: cursorVisible ? 1 : 0 }}
            aria-hidden
          >
            {cursorChar}
          </span>
        ))}
    </span>
  )
}
