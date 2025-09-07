import memoize from "lodash/memoize";
import { createClient } from "../core/client";
import { EchoClient } from "./client";

export const createEchoClient = memoize(
  (name: string = "Echo Client"): Promise<EchoClient> =>
    createClient({
      worker: new SharedWorker(
        new URL("./worker-runtime.ts", import.meta.url),
        {
          type: "module",
          name,
        },
      ),
      Client: EchoClient,
    }),
);

export const getEchoClientOne = () => createEchoClient("Echo One");
export const getEchoClientTwo = () => createEchoClient("Echo Two");
