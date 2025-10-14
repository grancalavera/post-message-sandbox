import { useEffect, useRef, useState } from "react";
import { VaultClient } from "./shared-worker/vault";
import { createClient } from "./shared-worker/core/client";

function App() {
  const [workerUrl, setWorkerUrl] = useState<string>("");
  const [secretSet, setSecretSet] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const initializeWorker = async () => {
      const workerScript = new URL(
        "./shared-worker/vault/worker-runtime.ts",
        import.meta.url,
      );
      const workerName = "vault-worker";

      const worker = new SharedWorker(workerScript, {
        type: "module",
        name: workerName,
      });

      const client = await createClient({
        worker,
        Client: VaultClient,
      });

      await client.setSecret("My Secret Message");
      setSecretSet(true);

      setWorkerUrl(workerScript.href);

      setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: "worker-handshake",
              workerUrl: workerScript.href,
              workerName: workerName,
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
