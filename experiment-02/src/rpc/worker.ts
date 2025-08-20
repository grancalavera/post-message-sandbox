import * as Comlink from "comlink";
import type { EchoContract } from "./model";
import type { ClientRegistryContract, RemoteContract } from "./service";

interface ClientRep {
  clientId: string;
  onEcho?: (message: string) => void;
}

const clientRep = (clientId: string): ClientRep => ({ clientId });

class Worker implements RemoteContract<EchoContract & ClientRegistryContract> {
  private clients: Map<string, ClientRep> = new Map();

  async registerClient(clientId: string): Promise<void> {
    if (this.clients.has(clientId)) return;

    console.log("registerClient", clientId);
    this.clients.set(clientId, clientRep(clientId));

    navigator.locks.request(clientId, async () => {
      console.log("unregisterClient", clientId);
      this.clients.delete(clientId);
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
    const client = this.getClient(clientId);
    console.log(`subscribeEcho: ${clientId}`);
    this.clients.set(clientId, {
      ...client,
      onEcho: callback,
    });
  }

  unsubscribeEcho(clientId: string): void {
    const client = this.getClient(clientId);
    console.log(`unsubscribeEcho: ${clientId}`);
    this.clients.set(clientId, { ...client, onEcho: undefined });
  }

  private getClient(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Unknown client ${clientId}`);
    }
    return client;
  }

  private broadcastEcho(message: string): void {
    this.clients.forEach((client) => {
      client.onEcho?.(message);
    });
  }
}

declare const self: SharedWorkerGlobalScope;

const worker = new Worker();

self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  Comlink.expose(worker, port);
});
