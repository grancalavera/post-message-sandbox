import { createClient } from "../core/client";
import { EchoClient } from "./client";

export const echoClientOne = await createClient(
  new SharedWorker(new URL("./worker-runtime.ts", import.meta.url), {
    type: "module",
    // https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker#name
    name: "Echo One",
  }),
  EchoClient,
);

export const echoClientTwo = await createClient(
  new SharedWorker(new URL("./worker-runtime.ts", import.meta.url), {
    type: "module",
    // https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker#name
    name: "Echo Two",
  }),
  EchoClient,
);
