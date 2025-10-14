import { BaseWorker } from "../core/worker";
import type { VaultWorkerContract } from "./contract";

export class VaultWorker extends BaseWorker implements VaultWorkerContract {
  private secretMessage: string = "";

  async setSecret(clientId: string, secret: string): Promise<void> {
    this.secretMessage = secret;
    console.log(`[VaultWorker] Secret set by client ${clientId}`);
  }

  async getSecret(clientId: string): Promise<string> {
    console.log(`[VaultWorker] Secret retrieved by client ${clientId}`);
    return this.secretMessage;
  }
}
