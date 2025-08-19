import type { ClientRegistryContract } from "./model";
import * as Comlink from "comlink";

interface ClientDescriptor {
  clientId: string;
}

class Worker implements ClientRegistryContract {
  private clients: Map<string, ClientDescriptor> = new Map();

  registerClient(clientId: string): void {
    if (this.clients.has(clientId)) return;
    this.clients.set(clientId, { clientId });
    console.log(`Client registered: ${clientId}`);
  }
}

declare const self: SharedWorkerGlobalScope;
const worker = new Worker();

self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  Comlink.expose(worker, port);
});
