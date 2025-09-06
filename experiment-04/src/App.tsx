import { useState, useEffect } from "react";
import { EchoDemo } from "./EchoDemo";
import { getEchoClientOne, getEchoClientTwo } from "./shared-worker/echo";
import type { EchoClient } from "./shared-worker/echo/client";

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: isActive ? "#007acc" : "#f8f9fa",
        color: isActive ? "white" : "#333",
        border: "none",
        borderBottom: isActive ? "2px solid #007acc" : "none",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  isActive: boolean;
  children: React.ReactNode;
}

function TabPanel({ isActive, children }: TabPanelProps) {
  return <div style={{ display: isActive ? "block" : "none" }}>{children}</div>;
}

function App() {
  const [activeTab, setActiveTab] = useState<"echo1" | "echo2">("echo1");
  const [echoClientOne, setEchoClientOne] = useState<EchoClient | null>(null);
  const [echoClientTwo, setEchoClientTwo] = useState<EchoClient | null>(null);

  useEffect(() => {
    const initClients = async () => {
      try {
        const [clientOne, clientTwo] = await Promise.all([
          getEchoClientOne(),
          getEchoClientTwo(),
        ]);
        setEchoClientOne(clientOne);
        setEchoClientTwo(clientTwo);
      } catch (error) {
        console.error("Failed to initialize echo clients:", error);
      }
    };

    initClients();
  }, []);

  if (!echoClientOne || !echoClientTwo) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading echo clients...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #ddd",
          marginBottom: "10px",
        }}
      >
        <TabButton
          isActive={activeTab === "echo1"}
          onClick={() => setActiveTab("echo1")}
        >
          Echo 1
        </TabButton>
        <TabButton
          isActive={activeTab === "echo2"}
          onClick={() => setActiveTab("echo2")}
        >
          Echo 2
        </TabButton>
      </div>
      <TabPanel isActive={activeTab === "echo1"}>
        <EchoDemo echoClient={echoClientOne} />
      </TabPanel>
      <TabPanel isActive={activeTab === "echo2"}>
        <EchoDemo echoClient={echoClientTwo} />
      </TabPanel>
    </div>
  );
}

export default App;
