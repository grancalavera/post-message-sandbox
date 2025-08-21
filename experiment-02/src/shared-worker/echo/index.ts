import { createClient } from "../core/client";
import { EchoClient } from "./client";

export const echoClient = await createClient(
  new SharedWorker(new URL("./worker.ts", import.meta.url), {
    type: "module",
    name: "Echo",
  }),
  EchoClient,
);
