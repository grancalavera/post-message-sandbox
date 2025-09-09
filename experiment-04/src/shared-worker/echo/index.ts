import memoize from "lodash/memoize";
import { createClient } from "../core/client";
import type { EchoContract } from "./contract";
import { mutations, queries, subscriptions } from "../core/model";

const getClient = memoize((name: string = "Echo Client") =>
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

const client = getClient();

export const subscribe = subscriptions(client);

// This is moving the client promise (Promise<EchoContract>) "inside" each one
// of the operations. This could also be done inside another proxy or a more
// sophisticated constructor. The drawback of doing this is that what would
// normally look like accessing methods in an object turns into passing a string
// argument to a function, for example:
//
// echo.mutate("echo", "Hello World!")
//
export const query = queries(client);
export const mutate = mutations(client);
