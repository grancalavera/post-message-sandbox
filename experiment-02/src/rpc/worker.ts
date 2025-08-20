import * as Comlink from "comlink";
import type { EchoContract } from "./model";
import type { ClientRegistryContract, RemoteContract } from "./service";

interface ClientRep {
  clientId: string;
}

const clientRep = (clientId: string): ClientRep => ({ clientId });

class Worker implements RemoteContract<EchoContract & ClientRegistryContract> {
  private clients: Map<string, ClientRep> = new Map();

  async registerClient(clientId: string): Promise<void> {
    if (this.clients.has(clientId)) return;

    console.log("registerClient", clientId);
    this.clients.set(clientId, clientRep(clientId));

    navigator.locks.request(clientId, async () => {
      this.unregisterClient(clientId);
    });
  }

  private async unregisterClient(clientId: string): Promise<void> {
    console.log("unregisterClient", clientId);
    this.clients.delete(clientId);
  }

  async echo(clientId: string, message: string): Promise<string> {
    if (!this.clients.has(clientId)) {
      throw new Error(`Unknown client ${clientId}`);
    }
    console.log(`${clientId} echo "${message}"`);
    return `echo: ${message}`;
  }
}

declare const self: SharedWorkerGlobalScope;

const worker = new Worker();

self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  Comlink.expose(worker, port);
});
