import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import * as Comlink from 'comlink'
import '../index.css'

interface ChildAPI {
  sendMessage: (message: string) => Promise<string>;
  getStatus: () => Promise<string>;
}

function ChildApp() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [rendezvousKey, setRendezvousKey] = useState<string>('');

  const addMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  useEffect(() => {
    // Parse rendezvous key from URL
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key');
    
    if (!key) {
      addMessage('Error: No rendezvous key found in URL');
      return;
    }
    
    setRendezvousKey(key);
    addMessage(`Parsed rendezvous key from URL: ${key}`);

    // Connect to SharedWorker
    try {
      const worker = new SharedWorker('/src/experiment-02/broker.worker.ts', { type: 'module' });
      
      worker.port.addEventListener('message', (event) => {
        const { type, port: transferredPort } = event.data;
        
        if (type === 'port') {
          addMessage("Received MessagePort from SharedWorker");
          
          // Create API object to expose via Comlink
          const api: ChildAPI = {
            sendMessage: async (message: string) => {
              addMessage(`Received message from parent: "${message}"`);
              const response = `Echo: ${message} (processed by child)`;
              addMessage(`Sending response: "${response}"`);
              return response;
            },
            getStatus: async () => {
              const status = `Child window active, connected via SharedWorker, key: ${key}`;
              addMessage(`Status requested: ${status}`);
              return status;
            }
          };
          
          // Expose API via Comlink on the transferred port
          Comlink.expose(api, transferredPort);
          setIsConnected(true);
          addMessage("API exposed via Comlink on MessagePort");
        } else if (type === 'registered') {
          addMessage(`Registered as child with SharedWorker`);
        } else if (type === 'error') {
          addMessage(`SharedWorker error: ${event.data.message}`);
        }
      });
      
      worker.port.start();
      
      // Register as child with the key
      worker.port.postMessage({
        type: 'register',
        role: 'child',
        key: key
      });
      
      addMessage("Registered with SharedWorker as child");
    } catch (error) {
      addMessage(`Failed to connect to SharedWorker: ${error}`);
    }
  }, []);

  return (
    <div>
      <h1>Child Window - Experiment 02</h1>
      <p>
        This child window connects to the parent via a SharedWorker-brokered MessageChannel.
      </p>
      
      <div style={{ marginBottom: '1em' }}>
        <strong>Rendezvous Key:</strong> {rendezvousKey || 'Not found'}
      </div>
      
      <div style={{ marginBottom: '1em' }}>
        <span style={{ color: isConnected ? 'green' : 'red' }}>
          {isConnected ? 'Connected to parent via MessageChannel' : 'Waiting for connection...'}
        </span>
      </div>

      <div className="message-log">
        <h3>Message Log:</h3>
        <pre style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '1em' }}>
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChildApp />
  </React.StrictMode>,
)