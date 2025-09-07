import memoize from "lodash/memoize";
import { createClient } from "../core/client";
import type { EchoContract } from "./contract";

export const createEchoClient = memoize((name: string = "Echo Client") =>
  createClient<EchoContract>({
    sharedWorker: new SharedWorker(
      new URL("./worker-runtime.ts", import.meta.url),
      {
        type: "module",
        name,
      },
    ),
  }),
);
