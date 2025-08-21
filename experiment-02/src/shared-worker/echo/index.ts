import { createSharedWorkerService } from "../core/client";
import { EchoService } from "./client";

export const echoService = await createSharedWorkerService(
  new SharedWorker(new URL("./worker.ts", import.meta.url), {
    type: "module",
    name: "Echo Service",
  }),
  EchoService,
);

export type { EchoContract } from "./contract";
export { EchoService } from "./client";
