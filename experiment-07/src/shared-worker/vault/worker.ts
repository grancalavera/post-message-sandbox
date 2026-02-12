import { createWorker } from "@grancalavera/bridge";
import type { VaultContract } from "./contract";

export const vaultWorker = createWorker<VaultContract>(() => {
  let secretMessage = "";

  return {
    async setSecret(clientId, secret) {
      secretMessage = secret ?? "";
      console.log(`[VaultWorker] Secret set by client ${clientId}`);
    },
    async getSecret(clientId) {
      console.log(`[VaultWorker] Secret retrieved by client ${clientId}`);
      return secretMessage;
    },
  };
});
