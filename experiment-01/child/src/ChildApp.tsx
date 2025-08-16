import React from 'react'
import * as Comlink from 'comlink'

interface ChildWindowAPI {
  sendMessage: (message: string) => Promise<string>
}

function ChildApp() {
  const [messages, setMessages] = React.useState<string[]>([])
  const [isConnected, setIsConnected] = React.useState(false)

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'init' && event.ports && event.ports[0]) {
        const port = event.ports[0]
        
        // Create API object to expose to parent
        const api: ChildWindowAPI = {
          sendMessage: async (message: string) => {
            addMessage(`Received from parent: "${message}"`)
            const response = `Echo: ${message} (from child)`
            addMessage(`Responding to parent: "${response}"`)
            return response
          }
        }

        // Expose API through Comlink
        Comlink.expose(api, port)
        setIsConnected(true)
        addMessage('Connected to parent window via MessageChannel')
      }
    }

    window.addEventListener('message', handleMessage)
    addMessage('Child window loaded, waiting for connection...')

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Child Window</h2>
      <p>Status: {isConnected ? '🟢 Connected' : '🔴 Waiting for connection'}</p>
      
      <div className="message-log">
        <h3>Message Log:</h3>
        <pre>
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </pre>
      </div>
    </div>
  )
}

export default ChildApp