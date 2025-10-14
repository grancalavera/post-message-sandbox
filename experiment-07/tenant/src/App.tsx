import { useEffect, useState } from "react";
import { VaultClient } from "../../src/shared-worker/vault";
import { createClient } from "../../src/shared-worker/core/client";

interface HandshakeMessage {
  type: string;
  workerUrl: string;
  workerName: string;
}

function App() {
  const [handshakeReceived, setHandshakeReceived] = useState(false);
  const [secret, setSecret] = useState<string>("");
  const [workerInfo, setWorkerInfo] = useState<{
    url: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<HandshakeMessage>) => {
      if (event.data.type === "worker-handshake") {
        console.log("[Tenant] Received handshake:", event.data);
        setHandshakeReceived(true);
        setWorkerInfo({
          url: event.data.workerUrl,
          name: event.data.workerName,
        });

        const worker = new SharedWorker(event.data.workerUrl, {
          type: "module",
          name: event.data.workerName,
        });

        const client = await createClient({
          worker,
          Client: VaultClient,
        });

        const retrievedSecret = await client.getSecret();
        console.log("[Tenant] Retrieved secret:", retrievedSecret);
        setSecret(retrievedSecret);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Tenant Application</h3>
      <div>
        <p>Handshake received: {handshakeReceived ? "✓" : "Waiting..."}</p>
        {workerInfo && (
          <div>
            <p style={{ fontSize: "0.9em", wordBreak: "break-all" }}>
              Worker URL: {workerInfo.url}
            </p>
            <p style={{ fontSize: "0.9em" }}>Worker Name: {workerInfo.name}</p>
          </div>
        )}
        <p>
          <strong>Secret from worker:</strong>{" "}
          {secret || "Waiting for handshake..."}
        </p>
      </div>
    </div>
  );
}

export default App;
