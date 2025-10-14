import { useEffect, useRef, useState } from "react";
import {
  createVaultClientDefault,
  VAULT_WORKER_URL,
  VAULT_WORKER_NAME,
} from "./shared-worker/vault";

function App() {
  const [workerUrl, setWorkerUrl] = useState<string>("");
  const [secretSet, setSecretSet] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const initializeWorker = async () => {
      const client = await createVaultClientDefault();

      await client.setSecret("My Secret Message");
      setSecretSet(true);

      setWorkerUrl(VAULT_WORKER_URL);

      setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: "worker-handshake",
              workerUrl: VAULT_WORKER_URL,
              workerName: VAULT_WORKER_NAME,
            },
            "*",
          );
        }
      }, 1000);
    };

    initializeWorker();
  }, []);

  return (
    <section>
      <h1>experiment-07: Handshakes</h1>
      <div>
        <h2>Host Application</h2>
        <p>Worker URL: {workerUrl || "Loading..."}</p>
        <p>Secret set in worker: {secretSet ? "✓" : "..."}</p>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <h2>Tenant Application (iframe)</h2>
        <iframe
          ref={iframeRef}
          src="/experiment-07/tenant/"
          style={{
            width: "100%",
            height: "300px",
            border: "2px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>
    </section>
  );
}

export default App;
