import { createClient } from "../core/client";
import { ClockClient } from "./client";

export const clockAndLine = await createClient(
  new SharedWorker(new URL("./worker-runtime.ts", import.meta.url), {
    type: "module",
    // https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker#name
    name: "Clock & Line",
  }),
  ClockClient,
);
