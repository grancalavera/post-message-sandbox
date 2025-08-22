import { useState } from "react";
import type { Unsubscribe } from "./shared-worker/core/meta";
import { echoClient1 } from "./shared-worker/echo";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [echoInput, setEchoInput] = useState("Hello World");
  const [responseLog, setResponseLog] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe>();

  const sendEcho = async () => {
    try {
      const response = await echoClient1.echo(echoInput);
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
      unsubscribe?.();
      setIsSubscribed(false);
      setUnsubscribe(undefined);
    } else {
      setIsSubscribed(true);
      async function doSubscribe() {
        const unsubscribe = await echoClient1.subscribeEcho((message) => {
          setMessages((prev) => [
            `${new Date().toLocaleTimeString()}: ${message}`,
            ...prev.slice(0, 9),
          ]);
        });
        // like this because the signature of Unsubscribe matches the signature
        // of the factory function in useState
        setUnsubscribe(() => unsubscribe);
      }
      doSubscribe();
    }
  };

  return (
    <div
      style={{
        padding: "10px",
        fontFamily: "system-ui",
        maxWidth: "720px",
        fontSize: "14px",
      }}
    >
      <h1 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
        Experiment 02: Echo Demo
      </h1>

      <div style={{ display: "flex", gap: "10px", height: "240px" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Send Echo</h3>
          <input
            type="text"
            value={echoInput}
            onChange={(e) => setEchoInput(e.target.value)}
            placeholder="Enter message"
            style={{
              width: "100%",
              padding: "6px",
              marginBottom: "8px",
              fontSize: "12px",
            }}
          />
          <button
            onClick={sendEcho}
            style={{
              padding: "6px 12px",
              background: "#007acc",
              color: "white",
              border: "none",
              borderRadius: "3px",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            Send Echo
          </button>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "3px",
              padding: "6px",
              height: "140px",
              overflow: "auto",
              fontSize: "11px",
            }}
          >
            <strong>Responses:</strong>
            {responseLog.length === 0 ? (
              <div style={{ color: "#999", fontStyle: "italic" }}>
                No responses yet...
              </div>
            ) : (
              responseLog.map((log, i) => (
                <div
                  key={i}
                  style={{ marginTop: "3px", fontFamily: "monospace" }}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Subscribe</h3>
          <button
            onClick={toggleSubscription}
            style={{
              padding: "6px 12px",
              background: isSubscribed ? "#dc3545" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "3px",
              fontSize: "12px",
              marginBottom: "4px",
            }}
          >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </button>
          <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>
            {isSubscribed ? "✅ Subscribed" : "❌ Not subscribed"}
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "3px",
              padding: "6px",
              height: "140px",
              overflow: "auto",
              fontSize: "11px",
            }}
          >
            <strong>Messages:</strong>
            {messages.length === 0 ? (
              <div style={{ color: "#999", fontStyle: "italic" }}>
                {isSubscribed ? "Waiting..." : "Subscribe to see messages"}
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  style={{ marginTop: "3px", fontFamily: "monospace" }}
                >
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
