import { createClient } from "../core/client";
import { EchoClient } from "./client";

export const echoClient1 = await createClient(
  new SharedWorker(new URL("./worker.ts?id=echo-1", import.meta.url), {
    type: "module",
    name: "Echo 1",
  }),
  EchoClient,
);

export const echoClient2 = await createClient(
  new SharedWorker(new URL("./worker.ts?id=echo-2", import.meta.url), {
    type: "module",
    name: "Echo 2",
  }),
  EchoClient,
);
// 740 x 340
