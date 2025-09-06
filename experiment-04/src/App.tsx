import * as echo from "./shared-worker/echo";

const client = await echo.getEchoClientOne();

function App() {
  return (
    <div>
      <h1>Shared Worker Echo Demo</h1>
      <button
        onClick={async () => {
          const response = await client.echo("Hello, World!");
          alert(response);
        }}
      >
        Send Echo
      </button>
    </div>
  );
}

export default App;
