import type { Contract, Mutation } from "../core/types";

type VaultContract = Contract<{
  setSecret: Mutation<string, void>;
  getSecret: Mutation<void, string>;
}>;

export type VaultWorkerContract = VaultContract["worker"];
export type VaultClientContract = VaultContract["client"];
