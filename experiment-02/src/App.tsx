import { useState } from "react";
import type { Unsubscribe } from "./shared-worker/core/meta";
import { EchoDemo } from "./EchoDemo";

function App() {
  const [echoSubscriptionMessages, setEchoSubscriptionMessages] = useState<
    string[]
  >([]);
  const [echoInput, setEchoInput] = useState("Hello World");
  const [echoResponseLog, setEchoResponseLog] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe>();

  const sendEcho = async (focusInput?: () => void) => {
    try {
      // Lazy import to avoid blocking the initial render
      const { echoClient1 } = await import("./shared-worker/echo");
      const response = await echoClient1.echo(echoInput);
      setEchoResponseLog((prev) => [
        `Response: "${response}"`,
        ...prev.slice(0, 4),
      ]);

      setEchoInput("");
      focusInput?.();
    } catch (error) {
      setEchoResponseLog((prev) => [`Error: ${error}`, ...prev.slice(0, 4)]);
      focusInput?.();
    }
  };

  const toggleSubscription = async () => {
    if (isSubscribed) {
      unsubscribe?.();
      setIsSubscribed(false);
      setUnsubscribe(undefined);
    } else {
      setIsSubscribed(true);
      try {
        // Lazy import to avoid blocking the initial render
        const { echoClient1 } = await import("./shared-worker/echo");
        const unsubscribe = echoClient1.subscribeEcho((message) => {
          setEchoSubscriptionMessages((prev) => [
            `${new Date().toLocaleTimeString()}: ${message}`,
            ...prev.slice(0, 9),
          ]);
        });
        setUnsubscribe(() => unsubscribe);
      } catch (error) {
        setEchoResponseLog((prev) => [
          `Subscription Error: ${error}`,
          ...prev.slice(0, 4),
        ]);
        setIsSubscribed(false);
      }
    }
  };

  return (
    <EchoDemo
      echoInput={echoInput}
      setEchoInput={setEchoInput}
      echoResponseLog={echoResponseLog}
      setEchoResponseLog={setEchoResponseLog}
      echoSubscriptionMessages={echoSubscriptionMessages}
      setEchoSubscriptionMessages={setEchoSubscriptionMessages}
      isSubscribed={isSubscribed}
      onSendEcho={sendEcho}
      onToggleSubscription={toggleSubscription}
    />
  );
}

export default App;
