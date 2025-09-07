import { Subject } from "rxjs";
import { createSharedWorkerRuntime } from "../core/runtime";
import { createWorker } from "../core/worker";
import type { EchoContract } from "./contract";
import { echoWorker, registryWorker } from "./worker";

const worker = createWorker<EchoContract>((context) => {
  const echo$ = new Subject<string>();

  const notify = context.createNotifier(echo$);
  const subscribe = context.createSubscriber(echo$);

  return {
    async echo(clientId, message) {
      console.log("echo", { clientId, message });
      return notify(message);
    },

    async subscribeEcho(clientId, callback) {
      console.log("subscribeEcho", { clientId });
      return subscribe(clientId, callback);
    },
  };
});

createSharedWorkerRuntime({
  ...echoWorker,
  ...registryWorker,
});
