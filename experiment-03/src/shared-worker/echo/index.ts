import { createClient } from "../core/client";
import { EchoClient } from "./client";

let echoClientOneInstance: EchoClient | undefined;
let echoClientTwoInstance: EchoClient | undefined;

export const getEchoClientOne = async (): Promise<EchoClient> => {
  if (!echoClientOneInstance) {
    echoClientOneInstance = await createClient({
      worker: new SharedWorker(
        new URL("./worker-runtime.ts", import.meta.url),
        {
          type: "module",
          name: "Echo One",
        },
      ),
      Client: EchoClient,
      name: "Echo One",
    });
  }
  return echoClientOneInstance;
};

export const getEchoClientTwo = async (): Promise<EchoClient> => {
  if (!echoClientTwoInstance) {
    echoClientTwoInstance = await createClient({
      worker: new SharedWorker(
        new URL("./worker-runtime.ts", import.meta.url),
        {
          type: "module",
          name: "Echo Two",
        },
      ),
      Client: EchoClient,
      name: "Echo Two",
    });
  }
  return echoClientTwoInstance;
};
