import { useState, useRef, useEffect } from 'react'

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
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-4">No messages yet...</p>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.playerId === currentPlayer?.id
            return (
              <div key={index} className={`chat-message ${isOwnMessage ? 'bg-terminal-green/10' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm" style={{ color: msg.playerColor || '#00ff88' }}>
                    {msg.playerName}
                  </span>
                  <span className="text-gray-600 text-xs">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-gray-300 text-sm break-words">{msg.message}</p>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-panel-border shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type..."
            className="cyber-input flex-1 min-w-0 py-2 px-3 text-sm"
            maxLength={200}
          />
          <button 
            type="submit" 
            disabled={!input.trim()} 
            className="cyber-button py-2 px-3 text-sm shrink-0 whitespace-nowrap"
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chat
