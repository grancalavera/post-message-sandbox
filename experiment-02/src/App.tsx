import { useState } from "react";
import { echoService } from "./rpc/client";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [echoInput, setEchoInput] = useState("Hello World");
  const [responseLog, setResponseLog] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const sendEcho = async () => {
    try {
      const response = await echoService.echo(echoInput);
      setResponseLog((prev) => [
        `Response: "${response}"`,
        ...prev.slice(0, 4),
      ]);
    } catch (error) {
      setResponseLog((prev) => [`Error: ${error}`, ...prev.slice(0, 4)]);
    }
  };

  const toggleSubscription = () => {
    if (isSubscribed) {
      echoService.unsubscribeEcho();
      setIsSubscribed(false);
    } else {
      echoService.subscribeEcho((message) => {
        setMessages((prev) => [
          `${new Date().toLocaleTimeString()}: ${message}`,
          ...prev.slice(0, 9),
        ]);
      });
      setIsSubscribed(true);
    }
  };

  return (
    <div
      style={{ padding: "20px", fontFamily: "system-ui", maxWidth: "800px" }}
    >
      <h1>Experiment 02: Client Registration</h1>

      <div
        style={{
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>How This Works</h2>
        <p>
          This experiment demonstrates a type-safe RPC system using Comlink with
          SharedWorkers:
        </p>
        <ul>
          <li>
            <strong>Client Registration:</strong> Each tab registers with a
            SharedWorker using a unique client ID
          </li>
          <li>
            <strong>Request-Response:</strong> Send echo messages and get
            responses back
          </li>
          <li>
            <strong>Subscriptions:</strong> Subscribe to messages that broadcast
            to all connected tabs
          </li>
          <li>
            <strong>Auto Cleanup:</strong> Uses Web Locks API to detect when
            tabs close and cleanup automatically
          </li>
        </ul>
        <p>
          <strong>Client ID:</strong> <code>{echoService.getClientId()}</code>
        </p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <div>
          <h3>Request-Response Demo</h3>
          <p>
            Send a message and get an immediate response back. This demonstrates
            the RPC call pattern.
          </p>

          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              value={echoInput}
              onChange={(e) => setEchoInput(e.target.value)}
              placeholder="Enter message to echo"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <button
              onClick={sendEcho}
              style={{
                padding: "8px 16px",
                background: "#007acc",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Send Echo Request
            </button>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
              height: "120px",
              overflow: "auto",
            }}
          >
            <strong>Response Log:</strong>
            {responseLog.length === 0 ? (
              <div style={{ color: "#999", fontStyle: "italic" }}>
                No responses yet...
              </div>
            ) : (
              responseLog.map((log, i) => (
                <div
                  key={i}
                  style={{
                    marginTop: "5px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                  }}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3>Subscription Demo</h3>
          <p>
            Subscribe to messages that broadcast to all tabs. Open multiple tabs
            to see cross-tab communication.
          </p>

          <div style={{ marginBottom: "10px" }}>
            <button
              onClick={toggleSubscription}
              style={{
                padding: "8px 16px",
                background: isSubscribed ? "#dc3545" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            >
              {isSubscribed ? "Unsubscribe" : "Subscribe"} to Echo Messages
            </button>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Status: {isSubscribed ? "✅ Subscribed" : "❌ Not subscribed"}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "10px",
              height: "120px",
              overflow: "auto",
            }}
          >
            <strong>Broadcast Messages:</strong>
            {messages.length === 0 ? (
              <div style={{ color: "#999", fontStyle: "italic" }}>
                {isSubscribed
                  ? "Waiting for messages..."
                  : "Subscribe to see messages here"}
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginTop: "5px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                  }}
                >
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#e8f4fd",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <h3>Multi-Tab Testing</h3>
        <p>To test cross-tab communication:</p>
        <ol>
          <li>Open this experiment in multiple browser tabs</li>
          <li>Subscribe to echo messages in each tab</li>
          <li>Send an echo request from any tab</li>
          <li>Watch the broadcast messages appear in all subscribed tabs</li>
          <li>
            Close a tab and notice it gets automatically cleaned up from the
            registry
          </li>
        </ol>
        <p>
          <strong>Tip:</strong> Open the browser console to see additional
          logging from the client registration and worker lifecycle.
        </p>
      </div>
    </div>
  );
}

export default App;
