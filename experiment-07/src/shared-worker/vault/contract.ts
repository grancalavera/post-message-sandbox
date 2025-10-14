import type { Contract, Mutation } from "@grancalavera/bridge";

export type VaultContract = Contract<{
  setSecret: Mutation<void, string>;
  getSecret: Mutation<string, void>;
}>;
