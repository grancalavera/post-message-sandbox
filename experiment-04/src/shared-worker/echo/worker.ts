import { Subject } from "rxjs";
import { createWorker } from "../core/worker";
import type { EchoContract } from "./contract";

export const echoWorker = createWorker<EchoContract>(
  ({ notify, subscribe }) => {
    const echo$ = new Subject<string>();
    return {
      async echo(clientId, value) {
        const message = `[${new Date().toISOString()}, ${clientId}] ${value}`;
        console.log("echo", { clientId, message });
        return notify(echo$, message);
      },
      async subscribeEcho(clientId, callback) {
        console.log("subscribeEcho", { clientId });
        return subscribe(echo$, clientId, callback);
      },
    };
  }
);
