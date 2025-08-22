import type { Contract, Mutation } from "./meta";

type RegistryContract = Contract<{
  registerClient: Mutation;
}>;

export type RegistryWorkerContract = RegistryContract["worker"];
export type RegistryClientContract = RegistryContract["client"];
