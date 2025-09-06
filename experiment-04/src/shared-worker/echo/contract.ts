import type { Contract, Mutation, Subscription } from "../core/types";

export type EchoContract = Contract<{
  echo: Mutation<string, string>;
  subscribeEcho: Subscription<void, string>;
}>;
