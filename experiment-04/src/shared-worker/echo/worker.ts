import { map, share, Subject } from "rxjs";
import { createWorker } from "../core/worker";
import type { EchoContract } from "./contract";

export const echoWorker = createWorker<EchoContract>(
  ({ notify, subscribe }) => {
    const echo$ = new Subject<string>();

    const echoTimestamp$ = echo$.pipe(
      map((message) => `[${new Date().toISOString()}] ${message}`),
      share(),
    );

    return {
      async echo(clientId, value) {
        const message = `[${clientId}] ${value}`;
        console.log("echo", { clientId, message });
        return notify(echo$, message);
      },
      async subscribeEcho(clientId, timestamp: boolean | undefined, callback) {
        console.log("subscribeEcho", { clientId });
        return subscribe(
          timestamp ? echoTimestamp$ : echo$,
          clientId,
          callback,
        );
      },
    };
  },
);
