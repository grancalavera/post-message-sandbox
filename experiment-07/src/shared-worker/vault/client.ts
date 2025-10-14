import { WorkerProxy } from "../core/client";
import type { VaultClientContract, VaultWorkerContract } from "./contract";

export class VaultClient
  extends WorkerProxy<VaultWorkerContract>
  implements VaultClientContract
{
  constructor(port: MessagePort, clientId: string) {
    super(port, clientId);
  }

  setSecret(secret: string): Promise<void> {
    return this.proxy.setSecret(this.clientId, secret);
  }

  getSecret(): Promise<string> {
    return this.proxy.getSecret(this.clientId);
  }
}
