import type { Contract, Mutation, Subscription } from "../core/model";

export type EchoContract = Contract<{
  echo: Mutation<string, string>;
  subscribeEcho: Subscription<[timestamp?: boolean], string>;
}>;
