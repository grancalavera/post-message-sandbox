import { target, proxy } from "./proxy";

function App() {
  const handleDirectCall = () => {
    const result = target.multiplyByTwo(5);
    console.log("Direct call result:", result);
  };

  const handleProxyCall = () => {
    const result = proxy.multiplyByTwo("Calling multiplyByTwo via proxy!", 5);
    console.log("Proxy call result:", result);
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
          Call target.multiplyByTwo(5) directly
        </button>
        <button onClick={handleProxyCall} style={{ margin: "5px" }}>
          Call proxy.multiplyByTwo('message', 5)
        </button>
        <button onClick={handlePropertyAccess} style={{ margin: "5px" }}>
          Access someProperty via both
        </button>
      </div>
      <p style={{ marginTop: "20px" }}>
        Check the console to see the proxy intercepting function calls and
        logging the message argument.
      </p>
    </section>
  );
}

export default App;
