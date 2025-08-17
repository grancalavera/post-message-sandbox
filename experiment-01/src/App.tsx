import { useState, useRef } from "react";
import * as Comlink from "comlink";

interface ChildWindowAPI {
  sendMessage: (message: string) => Promise<string>;
}

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const childWindowRef = useRef<Window | null>(null);
  const childAPIRef = useRef<Comlink.Remote<ChildWindowAPI> | null>(null);

  const addMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const openChildWindow = () => {
    if (childWindowRef.current && !childWindowRef.current.closed) {
      addMessage("Child window already open");
      return;
    }

    const childWindow = window.open(
      "/experiment-01/child/",
      "childWindow",
      "width=500,height=600,left=100,top=100,scrollbars=yes,resizable=yes",
    );

    if (!childWindow) {
      addMessage("Failed to open child window");
      return;
    }

    childWindowRef.current = childWindow;
    addMessage("Child window opened");

    // Wait for child window to load and establish Comlink connection
    childWindow.addEventListener("load", () => {
      const { port1, port2 } = new MessageChannel();

      // Send port2 to child window
      childWindow.postMessage("init", "*", [port2]);

      // Wrap port1 with Comlink
      childAPIRef.current = Comlink.wrap<ChildWindowAPI>(port1);
      addMessage("MessageChannel established with child window");
    });

    // Handle child window closing
    const checkClosed = setInterval(() => {
      if (childWindow.closed) {
        clearInterval(checkClosed);
        childAPIRef.current = null;
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

  const closeChildWindow = () => {
    if (childWindowRef.current && !childWindowRef.current.closed) {
      childWindowRef.current.close();
      childAPIRef.current = null;
      addMessage("Child window closed by parent");
    }
  };

  return (
    <div>
      <h1>Experiment 01: MessageChannel with Comlink</h1>
      <p>
        This experiment demonstrates communication between windows using
        MessageChannel API through Comlink.
      </p>

      <div>
        <button onClick={openChildWindow}>Open Child Window</button>
        <button onClick={closeChildWindow}>Close Child Window</button>
      </div>

      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Enter message to send to child"
          style={{ padding: "0.5em", margin: "0.5em", width: "300px" }}
        />
        <button onClick={sendMessageToChild}>Send Message</button>
      </div>

      <div className="message-log">
        <h3>Message Log:</h3>
        <pre>
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

export default App;
