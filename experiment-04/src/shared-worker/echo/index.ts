import memoize from "lodash/memoize";
import { createClient } from "../core/client";
import type { EchoContract } from "./contract";

export const createEchoClient = memoize((name: string = "Echo Client") => {
  return createClient<EchoContract>({
    sharedWorker: new SharedWorker(
      new URL("./worker-runtime.ts", import.meta.url),
      {
        type: "module",
        name,
      },
    ),
  });
});

export const getEchoClientOne = () => createEchoClient("Echo One");
export const getEchoClientTwo = () => createEchoClient("Echo Two");
