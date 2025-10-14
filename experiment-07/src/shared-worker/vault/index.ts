import { createClient } from "../core/client";
import { VaultClient } from "./client";
import WorkerUrl from "./worker-runtime.ts?sharedworker&url";

export const VAULT_WORKER_URL = WorkerUrl;
export const VAULT_WORKER_NAME = "vault-worker";

export const createVaultClient = (
  workerUrl: string,
  workerName: string,
): Promise<VaultClient> =>
  createClient({
    worker: new SharedWorker(workerUrl, {
      type: "module",
      name: workerName,
    }),
    Client: VaultClient,
  });

export const createVaultClientDefault = (): Promise<VaultClient> =>
  createVaultClient(VAULT_WORKER_URL, VAULT_WORKER_NAME);

export { VaultClient } from "./client";
export type { VaultClientContract } from "./contract";
