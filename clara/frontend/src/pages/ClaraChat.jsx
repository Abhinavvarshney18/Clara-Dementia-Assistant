import { useEffect, useRef, useState } from 'react'
import { HeartPulse, RotateCcw, Send, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api, { getApiError } from '../utils/api'

const quickPrompts = [
  'I feel confused right now',
  'What should I do next?',
  'Remind me to drink water',
  'I am feeling lonely',
]

function normalizeHistory(rows, name) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return [
      {
        role: 'assistant',
        content: `Hello ${name || 'there'}. I am Clara. I can help you feel oriented, remember simple tasks, or stay calm for a moment.`,
      },
    ]
  }

  return rows.map((row) => ({
    role: row.role,
    content: row.message,
  }))
}

export default function ClaraChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const firstName = user?.name?.split(' ')[0]

  useEffect(() => {
    let active = true

    async function loadHistory() {
      setLoading(true)
      try {
        const { data } = await api.get('/clara/history')
        if (active) setMessages(normalizeHistory(data, firstName))
      } catch (error) {
        if (active) setMessages(normalizeHistory([], firstName))
        toast.error(getApiError(error, 'Could not load Clara history.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadHistory()
    return () => {
      active = false
    }
  }, [firstName])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const sendMessage = async (text = input) => {
    const message = text.trim()
    if (!message || sending) return

    setMessages((current) => [...current, { role: 'user', content: message }])
    setInput('')
    setSending(true)

    try {
      const { data } = await api.post('/clara/chat', { message })
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'I had trouble connecting just now. Please try again in a moment, or contact your caregiver if this is urgent.',
        },
      ])
      toast.error(getApiError(error, 'Clara could not respond.'))
    } finally {
      setSending(false)
    }
  }

  const clearHistory = async () => {
    try {
      await api.delete('/clara/history')
      setMessages(normalizeHistory([], firstName))
      toast.success('Conversation cleared.')
    } catch (error) {
      toast.error(getApiError(error, 'Could not clear conversation.'))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage()
  }

  return (
    <div className="page-stack">
      <section className="page-head">
        <div>
          <p className="eyebrow">Companion</p>
          <h2>Talk to Clara</h2>
          <p>
            Clara responds with calm, practical support. For emergencies or medical decisions,
            contact a caregiver or healthcare professional.
          </p>
        </div>
      </section>

      <section className="chat-shell">
        <header className="chat-header">
          <div className="chat-title">
            <div className="brand-mark">
              <HeartPulse size={22} />
            </div>
            <div>
              <h2>Clara is online</h2>
              <p>Warm support, reminders, and simple grounding.</p>
            </div>
          </div>
          <button className="button ghost" type="button" onClick={clearHistory}>
            <Trash2 size={16} />
            Clear
          </button>
        </header>

        <div className="messages">
          {loading ? (
            <div className="message-row">
              <div className="message-bubble">Loading your conversation...</div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div className={`message-row ${message.role === 'user' ? 'user' : ''}`} key={`${message.role}-${index}`}>
                {message.role !== 'user' && <HeartPulse size={22} color="#176b5b" />}
                <div className="message-bubble">{message.content}</div>
              </div>
            ))
          )}

          {sending && (
            <div className="message-row">
              <Sparkles size={22} color="#176b5b" />
              <div className="message-bubble">Clara is thinking...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            className="input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message to Clara"
            disabled={sending}
          />
          <button className="button primary" type="submit" disabled={sending || !input.trim()}>
            {sending ? <RotateCcw size={17} /> : <Send size={17} />}
            Send
          </button>
        </form>

        <div className="quick-prompts">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={sending}>
              {prompt}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
