import { useState, useRef } from "react";
import * as Comlink from "comlink";

interface ChildWindowAPI {
  sendMessage: (message: string) => Promise<string>;
  getStatus: () => Promise<string>;
}

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const childWindowRef = useRef<Window | null>(null);
  const childAPIRef = useRef<Comlink.Remote<ChildWindowAPI> | null>(null);
  const workerRef = useRef<SharedWorker | null>(null);

  const addMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const generateRendezvousKey = () => {
    return 'key-' + Math.random().toString(36).substring(2, 11);
  };

  const openChildWindow = () => {
    if (childWindowRef.current && !childWindowRef.current.closed) {
      addMessage("Child window already open");
      return;
    }

    // Generate rendezvous key
    const key = generateRendezvousKey();
    addMessage(`Generated rendezvous key: ${key}`);

    // Open child window with key in URL
    const childWindow = window.open(
      `/experiment-02/child.html?key=${key}`,
      "childWindow",
      "width=500,height=600,left=100,top=100,scrollbars=yes,resizable=yes"
    );

    if (!childWindow) {
      addMessage("Failed to open child window");
      return;
    }

    childWindowRef.current = childWindow;
    addMessage("Child window opened");

    // Connect to SharedWorker
    try {
      const worker = new SharedWorker('/src/experiment-02/broker.worker.ts', { type: 'module' });
      workerRef.current = worker;
      
      worker.port.addEventListener('message', (event) => {
        const { type, port: transferredPort } = event.data;
        
        if (type === 'port') {
          addMessage("Received MessagePort from SharedWorker");
          
          // Wrap the transferred port with Comlink
          childAPIRef.current = Comlink.wrap<ChildWindowAPI>(transferredPort);
          setIsConnected(true);
          addMessage("Comlink connection established with child window");
        } else if (type === 'registered') {
          addMessage(`Registered as parent with SharedWorker`);
        } else if (type === 'error') {
          addMessage(`SharedWorker error: ${event.data.message}`);
        }
      });
      
      worker.port.start();
      
      // Register as parent with the key
      worker.port.postMessage({
        type: 'register',
        role: 'parent',
        key: key
      });
      
      addMessage("Registered with SharedWorker as parent");
    } catch (error) {
      addMessage(`Failed to connect to SharedWorker: ${error}`);
    }

    // Handle child window closing
    const checkClosed = setInterval(() => {
      if (childWindow.closed) {
        clearInterval(checkClosed);
        childAPIRef.current = null;
        setIsConnected(false);
        addMessage("Child window closed");
      }
    }, 1000);
  };

  const sendMessageToChild = async () => {
    if (!childAPIRef.current || !inputMessage.trim()) {
      addMessage("No child window connected or empty message");
      return;
    }

    try {
      addMessage(`Sending to child: "${inputMessage}"`);
      const response = await childAPIRef.current.sendMessage(inputMessage);
      addMessage(`Response from child: "${response}"`);
      setInputMessage("");
    } catch (error) {
      addMessage(`Error sending message: ${error}`);
    }
  };

  const getChildStatus = async () => {
    if (!childAPIRef.current) {
      addMessage("No child window connected");
      return;
    }

    try {
      const status = await childAPIRef.current.getStatus();
      addMessage(`Child status: ${status}`);
    } catch (error) {
      addMessage(`Error getting child status: ${error}`);
    }
  };

  const closeChildWindow = () => {
    if (childWindowRef.current && !childWindowRef.current.closed) {
      childWindowRef.current.close();
      childAPIRef.current = null;
      setIsConnected(false);
      addMessage("Child window closed by parent");
    }
  };

  return (
    <div>
      <h1>Experiment 02: SharedWorker-brokered MessageChannel</h1>
      <p>
        This experiment uses a SharedWorker to broker MessageChannel connections
        between parent and child windows using Comlink.
      </p>

      <div style={{ marginBottom: '1em' }}>
        <button onClick={openChildWindow} disabled={isConnected}>
          Open Child Window
        </button>
        <button onClick={closeChildWindow} disabled={!isConnected}>
          Close Child Window
        </button>
        <span style={{ marginLeft: '1em', color: isConnected ? 'green' : 'red' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div style={{ marginBottom: '1em' }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Enter message to send to child"
          style={{ padding: "0.5em", margin: "0.5em", width: "300px" }}
          disabled={!isConnected}
        />
        <button onClick={sendMessageToChild} disabled={!isConnected}>
          Send Message
        </button>
        <button onClick={getChildStatus} disabled={!isConnected}>
          Get Child Status
        </button>
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

export default App;