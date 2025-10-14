import { createClient } from "@grancalavera/bridge";
import type { VaultContract } from "./contract";

export const createVaultClientFromWorker = (sharedWorker: SharedWorker) => {
  const [client] = createClient<VaultContract>({ sharedWorker });
  return client;
};
