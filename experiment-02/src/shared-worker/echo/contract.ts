import type { Contract, Mutation, Subscription } from "../core/meta";

export type EchoContract = Contract<{
  /**
   * Echoes the message back to the client.
   */
  echo: Mutation<string, string>;
  /**
   * Subscribes to all echo messages.
   * @param callback
   */
  subscribeEcho: Subscription<void, string>;

  keepAlive: Mutation;
}>;

type A = EchoContract["client"];
type B = EchoContract["worker"];
