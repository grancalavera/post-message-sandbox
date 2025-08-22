import type { Contract, Mutation, Subscription } from "../core/meta";

type ClockContract = Contract<{
  time: Subscription<void, number>;
  openLine: Mutation<(value: number) => void, () => void>;
}>;

export type ClockWorkerContract = ClockContract["worker"];
export type ClockClientContract = ClockContract["client"];
