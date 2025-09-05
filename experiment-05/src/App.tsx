import { target, proxy } from "./proxy";

function App() {
  const handleDirectCall = () => {
    const result = target.multiplyByTwo("manual-id", 5);
    console.log("Direct internal API call result:", result);
  };

  const handleProxyCall = () => {
    const result = proxy.multiplyByTwo(5);
    console.log("Public API (proxy) call result:", result);
  };

  const handlePropertyAccess = () => {
    console.log("Direct property access:", target.someProperty);
    console.log("Proxy property access:", proxy.someProperty);
  };

  return (
    <section>
      <h1>
        {"experiment-05"}:{" "}
        {"JS Proxy: Pass additional arguments with Proxy traps"}
      </h1>
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleDirectCall} style={{ margin: "5px" }}>
          Call target.multiplyByTwo('manual-id', 5) directly
        </button>
        <button onClick={handleProxyCall} style={{ margin: "5px" }}>
          Call proxy.multiplyByTwo(5) - proxy adds ID
        </button>
        <button onClick={handlePropertyAccess} style={{ margin: "5px" }}>
          Access someProperty via both
        </button>
      </div>
      <p style={{ marginTop: "20px" }}>
        Check the console to see how the proxy automatically injects the proxy
        ID when calling the internal API.
      </p>
    </section>
  );
}

export default App;
