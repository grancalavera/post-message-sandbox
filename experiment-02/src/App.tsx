import { echoService } from "./rpc/client";

echoService.subscribeEcho((message) => {
  console.log(`Received echo: "${message}"`);
});

function App() {
  const sendEcho = async () => {
    const response = await echoService.echo("ok computer");
    console.log(`response: "${response}"`);
  };
  return (
    <section>
      <h1>
        {"experiment-02"}: {"client registration"}
      </h1>
      <button onClick={() => sendEcho()}>echo</button>
    </section>
  );
}

export default App;
