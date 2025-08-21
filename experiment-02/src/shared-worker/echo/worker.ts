import * as Comlink from "comlink";
import { BaseWorker } from "../core/worker";
import type { EchoContract } from "./contract";
import type { ClientRegistryContract, RemoteContract } from "../core/types";

interface EchoClientRep {
  clientId: string;
  onEcho?: (message: string) => void;
}

class EchoWorker
  extends BaseWorker
  implements RemoteContract<EchoContract & ClientRegistryContract>
{
  private echoClients: Map<string, EchoClientRep> = new Map();

  async registerClient(clientId: string): Promise<void> {
    if (this.clients.has(clientId)) return;

    console.log("registerClient", clientId);
    this.clients.set(clientId, { clientId });
    this.echoClients.set(clientId, { clientId });

    navigator.locks.request(clientId, async () => {
      console.log("unregisterClient", clientId);
      this.clients.delete(clientId);
      this.echoClients.delete(clientId);
    });
  }

  async echo(clientId: string, message: string): Promise<string> {
    this.getClient(clientId);
    const echoedMessage = `echo: ${message}`;
    console.log(clientId, echoedMessage);
    this.broadcastEcho(echoedMessage);
    return echoedMessage;
  }

  subscribeEcho(clientId: string, callback: (message: string) => void): void {
    const client = this.getEchoClient(clientId);
    console.log(`subscribeEcho: ${clientId}`);
    this.echoClients.set(clientId, {
      ...client,
      onEcho: callback,
    });
  }

  unsubscribeEcho(clientId: string): void {
    const client = this.getEchoClient(clientId);
    console.log(`unsubscribeEcho: ${clientId}`);
    this.echoClients.set(clientId, { ...client, onEcho: undefined });
  }

  private getEchoClient(clientId: string): EchoClientRep {
    const client = this.echoClients.get(clientId);
    if (!client) {
      throw new Error(`Unknown echo client ${clientId}`);
    }
    return client;
  }

  private broadcastEcho(message: string): void {
    this.echoClients.forEach((client) => {
      client.onEcho?.(message);
    });
  }
}

declare const self: SharedWorkerGlobalScope;

const worker = new EchoWorker();

self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  Comlink.expose(worker, port);
});
