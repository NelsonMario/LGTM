import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Icon } from '@/components/ui'
import type { ChatMessage, Player } from '@/types'

interface ChatProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  currentPlayer: Player | null
}

function formatTime(timestamp?: number) {
  if (timestamp == null) return ''
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Chat({ messages, onSendMessage, currentPlayer }: ChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-w-0">
        {messages.length === 0 ? (
          <p className="text-muted text-sm text-center py-4">No messages yet</p>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.playerId === currentPlayer?.id
            return (
              <div key={index} className={`chat-message ${isOwn ? 'own' : ''} w-full`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-xs shrink-0" style={{ color: msg.playerColor ?? '#18181b' }}>
                    {msg.playerName}
                  </span>
                  <span className="text-muted text-xs shrink-0">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-sm text-primary break-words overflow-wrap-anywhere">{msg.message}</p>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="input text-sm py-2 flex-1 min-w-0"
            maxLength={200}
          />
          <button type="submit" disabled={!input.trim()} className="btn btn-primary py-2 px-3 shrink-0">
            <Icon name="send" size={14} />
          </button>
        </div>
      </form>
    </div>
  )
}
