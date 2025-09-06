import memoize from "lodash/memoize";
import { createClient } from "../core/client";
import { EchoClient } from "./client";
import type { EchoContract } from "./contract";

export const createEchoClient = memoize((name: string = "Echo Client") => {
  return createClient<EchoContract>({
    worker: new SharedWorker(new URL("./worker-runtime.ts", import.meta.url), {
      type: "module",
      name,
    }),
    Client: EchoClient,
  });
});

export const getEchoClientOne = () => createEchoClient("Echo One");
export const getEchoClientTwo = () => createEchoClient("Echo Two");
