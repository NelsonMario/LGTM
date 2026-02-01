import { useState, useRef, useEffect } from 'react'
import Icon from './Icon'

function Chat({ messages, onSendMessage, currentPlayer }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-muted text-sm text-center py-4">No messages yet</p>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.playerId === currentPlayer?.id
            return (
              <div 
                key={index} 
                className={`chat-message ${isOwnMessage ? 'own' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="font-medium text-xs"
                    style={{ color: msg.playerColor || '#18181b' }}
                  >
                    {msg.playerName}
                  </span>
                  <span className="text-muted text-xs">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-primary">{msg.message}</p>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
          <button 
            type="submit" 
            disabled={!input.trim()} 
            className="btn btn-primary py-2 px-3 shrink-0"
          >
            <Icon name="send" size={14} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
