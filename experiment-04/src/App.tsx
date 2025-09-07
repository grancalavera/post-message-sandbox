import { from, Observable, switchMap } from "rxjs";
import * as echo from "./shared-worker/echo";
import { bind, Subscribe } from "@react-rxjs/core";
import { useState } from "react";
import * as Comlink from "comlink";

const echoClient = echo.createEchoClient();

const [useEcho] = bind(
  from(echoClient).pipe(
    switchMap(
      (client) =>
        new Observable<string>((subscriber) => {
          const unsubscribePromise = client.subscribeEcho(
            Comlink.proxy((message) => {
              subscriber.next(message);
            })
          );
          return () => unsubscribePromise.then((unsubscribe) => unsubscribe());
        })
    )
  )
);

const sendEcho = async (message: string) => {
  const client = await echoClient;
  return client.echo(message);
};

function App() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [echoResponse, setEchoResponse] = useState<string>("...");
  return (
    <div>
      <h3>Shared Worker Echo Demo</h3>
      <p>
        <a href="/">Home</a>
      </p>
      <section>
        <button
          onClick={async () => {
            const response = await sendEcho("Hello, World!");
            setEchoResponse(response);
          }}
        >
          Send Echo
        </button>
        <p>Response: {echoResponse}</p>
      </section>
      <section>
        <button onClick={() => setIsSubscribed((current) => !current)}>
          {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </button>
        {isSubscribed && (
          <Subscribe fallback={<p>Waiting for messages...</p>}>
            <EchoSubscription />
          </Subscribe>
        )}
      </section>
    </div>
  );
}

const EchoSubscription = () => {
  const echo = useEcho();
  return <p>{echo}</p>;
};

export default App;
