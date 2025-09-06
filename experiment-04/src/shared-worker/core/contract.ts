import type { Contract, Mutation } from "./types";

export type RegistryContract = Contract<{
  registerClient: Mutation;
}>;
