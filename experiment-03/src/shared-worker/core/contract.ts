import type { Contract, Mutation } from "./types";

type RegistryContract = Contract<{
  registerClient: Mutation;
}>;

export type RegistryWorkerContract = RegistryContract["worker"];
export type RegistryClientContract = RegistryContract["client"];
