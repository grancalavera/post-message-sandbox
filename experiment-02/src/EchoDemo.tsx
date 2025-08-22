import { useRef } from "react";

interface EchoDemoProps {
  echoInput: string;
  setEchoInput: (value: string) => void;
  echoResponseLog: string[];
  setEchoResponseLog: (
    value: string[] | ((prev: string[]) => string[]),
  ) => void;
  echoSubscriptionMessages: string[];
  setEchoSubscriptionMessages: (
    value: string[] | ((prev: string[]) => string[]),
  ) => void;
  isSubscribed: boolean;
  onSendEcho: (focusInput?: () => void) => void;
  onToggleSubscription: () => void;
}

export function EchoDemo({
  echoInput,
  setEchoInput,
  echoResponseLog,
  setEchoResponseLog,
  echoSubscriptionMessages,
  setEchoSubscriptionMessages,
  isSubscribed,
  onSendEcho,
  onToggleSubscription,
}: EchoDemoProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendEcho = () => {
    const focusInput = () => inputRef.current?.focus();
    onSendEcho(focusInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendEcho();
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
              onKeyDown={handleKeyDown}
              placeholder="Enter message"
              style={{
                flex: 1,
                padding: "6px",
                fontSize: "12px",
              }}
            />
            <button
              onClick={handleSendEcho}
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
              onClick={onToggleSubscription}
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
