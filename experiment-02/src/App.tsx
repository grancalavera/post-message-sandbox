import { useEffect, useState } from "react";
import { EchoDemo } from "./EchoDemo";
import type { EchoClient } from "./shared-worker/echo/client";

function App() {
  const [echoClient, setEchoClient] = useState<EchoClient | null>(null);

  useEffect(() => {
    const loadEchoClient = async () => {
      const { echoClient1 } = await import("./shared-worker/echo");
      setEchoClient(echoClient1);
    };
    loadEchoClient();
  }, []);

  if (!echoClient) {
    return <div>Loading...</div>;
  }

  return <EchoDemo echoClient={echoClient} />;
}

export default App;
