import { useState } from "react";
import { EchoDemo } from "./EchoDemo";
import { echoClient1, echoClient2 } from "./shared-worker/echo";

function App() {
  const [activeTab, setActiveTab] = useState<"echo1" | "echo2">("echo1");

  return (
    <div>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #ddd",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={() => setActiveTab("echo1")}
          style={{
            padding: "10px 20px",
            background: activeTab === "echo1" ? "#007acc" : "#f8f9fa",
            color: activeTab === "echo1" ? "white" : "#333",
            border: "none",
            borderBottom: activeTab === "echo1" ? "2px solid #007acc" : "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Echo 1
        </button>
        <button
          onClick={() => setActiveTab("echo2")}
          style={{
            padding: "10px 20px",
            background: activeTab === "echo2" ? "#007acc" : "#f8f9fa",
            color: activeTab === "echo2" ? "white" : "#333",
            border: "none",
            borderBottom: activeTab === "echo2" ? "2px solid #007acc" : "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Echo 2
        </button>
      </div>
      <div style={{ display: activeTab === "echo1" ? "block" : "none" }}>
        <EchoDemo echoClient={echoClient1} />
      </div>
      <div style={{ display: activeTab === "echo2" ? "block" : "none" }}>
        <EchoDemo echoClient={echoClient2} />
      </div>
    </div>
  );
}

export default App;
