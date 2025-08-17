import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>
        {"{{EXPERIMENT_NAME}}"}: {"{{EXPERIMENT_DESCRIPTION}}"}
      </h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>{"{{EXPERIMENT_NAME}}"}/src/App.tsx</code> and save to test
          HMR
        </p>
      </div>
      <p className="read-the-docs">
        This is experiment {"{{EXPERIMENT_NUMBER}}"}:{" "}
        {"{{EXPERIMENT_DESCRIPTION}}"}
      </p>
    </>
  );
}

export default App;
