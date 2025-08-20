import { echoService } from "./rpc/client";
import { useState, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    // Get client ID from the service for display
    setClientId(echoService.getClientId().slice(0, 8));

    // Load initial messages
    loadMessages();

    // Poll for new messages every 2 seconds to show cross-tab communication
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const sharedMessages = await echoService.getMessages();
      setMessages(sharedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendEcho = async () => {
    if (!inputMessage.trim()) return;

    try {
      await echoService.echo(inputMessage);
      setInputMessage("");
      // Immediately refresh messages to show the new one
      await loadMessages();
    } catch (error) {
      console.error("Echo failed:", error);
    }
  };

  const broadcastMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await echoService.broadcast(inputMessage);
      setInputMessage("");
      // Immediately refresh messages to show the new one
      await loadMessages();
    } catch (error) {
      console.error("Broadcast failed:", error);
    }
  };

  return (
    <section style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>
        {"experiment-02"}: {"client registration"}
      </h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <strong>Client ID:</strong> {clientId}
        <br />
        <small>
          Open multiple tabs to see cross-tab communication in action
        </small>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Enter message to echo..."
          style={{
            padding: "8px",
            marginRight: "10px",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
          onKeyDown={(e) => e.key === "Enter" && sendEcho()}
        />
        <button
          onClick={sendEcho}
          style={{ padding: "8px 16px", marginRight: "10px" }}
        >
          Send Echo
        </button>
        <button
          onClick={broadcastMessage}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007acc",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Broadcast
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          backgroundColor: "#fafafa",
        }}
      >
        <h3>Shared Message Log (Updates every 2 seconds)</h3>
        {messages.length === 0 ? (
          <div style={{ color: "#666", fontStyle: "italic" }}>
            No messages yet. Send an echo or broadcast, or open multiple tabs to
            see cross-tab communication.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "5px",
                padding: "5px",
                backgroundColor: msg.includes("broadcast")
                  ? "#e7f3ff"
                  : "white",
                borderLeft: msg.includes("broadcast")
                  ? "3px solid #007acc"
                  : "3px solid #28a745",
                borderRadius: "2px",
              }}
            >
              {msg}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <h4>Instructions for Multi-Tab Testing:</h4>
        <ol>
          <li>Open this page in multiple browser tabs</li>
          <li>Each tab will have a unique client ID (shown above)</li>
          <li>Send echoes or broadcasts from different tabs</li>
          <li>
            Watch the shared message log update automatically every 2 seconds
          </li>
          <li>
            All messages are stored in the SharedWorker and visible across all
            tabs
          </li>
          <li>
            Blue border = broadcast messages, Green border = echo messages
          </li>
        </ol>
      </div>
    </section>
  );
}

export default App;
