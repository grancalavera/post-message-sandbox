import { useState, useRef } from "react";
import type { Unsubscribe } from "./shared-worker/core/meta";
import { echoClient1 } from "./shared-worker/echo";

function App() {
  const [echoSubscriptionMessages, setEchoSubscriptionMessages] = useState<
    string[]
  >([]);
  const [echoInput, setEchoInput] = useState("Hello World");
  const [echoResponseLog, setEchoResponseLog] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe>();
  const inputRef = useRef<HTMLInputElement>(null);

  const sendEcho = async () => {
    try {
      const response = await echoClient1.echo(echoInput);
      setEchoResponseLog((prev) => [
        `Response: "${response}"`,
        ...prev.slice(0, 4),
      ]);

      setEchoInput("");
      inputRef.current?.focus();
    } catch (error) {
      setEchoResponseLog((prev) => [`Error: ${error}`, ...prev.slice(0, 4)]);
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
          setEchoSubscriptionMessages((prev) => [
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

      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Send Echo</h3>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "8px",
              height: "32px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={echoInput}
              onChange={(e) => setEchoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendEcho()}
              placeholder="Enter message"
              style={{
                flex: 1,
                padding: "6px",
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
              }}
            >
              Send
            </button>
            <button
              onClick={() => setEchoResponseLog([])}
              style={{
                padding: "6px 12px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              Clear
            </button>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "3px",
              padding: "6px",
              height: "200px",
              overflow: "auto",
              fontSize: "11px",
              flex: 1,
            }}
          >
            <strong>Echo Responses:</strong>
            {echoResponseLog.length === 0 ? (
              <div style={{ color: "#999", fontStyle: "italic" }}>
                No responses yet...
              </div>
            ) : (
              echoResponseLog.map((log, i) => (
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

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Subscribe</h3>
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "8px",
              height: "32px",
            }}
          >
            <button
              onClick={toggleSubscription}
              style={{
                padding: "6px 12px",
                background: isSubscribed ? "#dc3545" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              {isSubscribed ? "Unsubscribe" : "Subscribe"}
            </button>
            <button
              onClick={() => setEchoSubscriptionMessages([])}
              style={{
                padding: "6px 12px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "3px",
                fontSize: "12px",
              }}
            >
              Clear
            </button>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "3px",
              padding: "6px",
              height: "200px",
              overflow: "auto",
              fontSize: "11px",
              flex: 1,
            }}
          >
            <strong>Echo Subscription Messages:</strong>
            {echoSubscriptionMessages.length === 0 ? (
              <div style={{ color: "#999", fontStyle: "italic" }}>
                {isSubscribed ? "Waiting..." : "Subscribe to see messages"}
              </div>
            ) : (
              echoSubscriptionMessages.map((msg, i) => (
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
