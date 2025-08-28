import type { Contract, Mutation, Subscription } from "../core/types";

type EchoContract = Contract<{
  echo: Mutation<string, string>;
  subscribeEcho: Subscription<void, string>;
}>;

export type EchoWorkerContract = EchoContract["worker"];
export type EchoClientContract = EchoContract["client"];
