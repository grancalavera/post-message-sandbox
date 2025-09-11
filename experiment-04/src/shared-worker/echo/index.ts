import { createClient } from "../core/client";
import { subscriptions } from "../core/model";
import type { EchoContract } from "./contract";
import EchoWorker from "./worker-runtime?sharedworker";

export const echoClient = createClient<EchoContract>({
  sharedWorker: new EchoWorker({ name: "Echo Worker" }),
});

export const subscribe = subscriptions(echoClient);
