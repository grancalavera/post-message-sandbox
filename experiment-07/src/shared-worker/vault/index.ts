import { createVaultClientFromWorker } from "./client";
import WorkerUrl from "./worker-runtime.ts?sharedworker&url";

export const VAULT_WORKER_URL = WorkerUrl;
export const VAULT_WORKER_NAME = "vault-worker";

export const createVaultClient = (workerUrl: string, workerName: string) =>
  createVaultClientFromWorker(
    new SharedWorker(workerUrl, {
      type: "module",
      name: workerName,
    }),
  );

export const createVaultClientDefault = () =>
  createVaultClient(VAULT_WORKER_URL, VAULT_WORKER_NAME);

export type { VaultContract } from "./contract";
