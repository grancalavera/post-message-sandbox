import * as Comlink from "comlink";
import { BaseWorker, createClientRep, type WithClientId } from "../core/worker";
import type { EchoWorkerContract } from "./contract";
import type { RegistryWorkerContract } from "../core/types";

interface EchoClientRep extends WithClientId {
  onEcho?: (message: string) => void;
}

type CombinedContract = EchoWorkerContract & RegistryWorkerContract;

class EchoWorker extends BaseWorker<EchoClientRep> implements CombinedContract {
  constructor() {
    super(createClientRep);
  }

  async echo(
    clientId: string,
    correlationId: string,
    message: string
  ): Promise<string> {
    this.getClient(clientId);
    const echoedMessage = `echo: ${message}`;
    console.log(clientId, correlationId, echoedMessage);
    this.broadcastEcho(echoedMessage);
    return echoedMessage;
  }

  subscribeEcho_subscribe(
    clientId: string,
    correlationId: string,
    callback: (message: string) => void
  ): void {
    const client = this.getClient(clientId);
    console.log("subscribeEcho", clientId, correlationId);
    this.clients.set(clientId, {
      ...client,
      onEcho: callback,
    });
  }

  subscribeEcho_unsubscribe(clientId: string, correlationId: string): void {
    const client = this.getClient(clientId);
    console.log("unsubscribeEcho", clientId, correlationId);
    this.clients.set(clientId, { ...client, onEcho: undefined });
  }

  async registerClient(clientId: string, correlationId: string): Promise<void> {
    if (this.clients.has(clientId)) return;

    console.log("registerClient", clientId, correlationId);
    this.clients.set(clientId, this.createClientRep(clientId));

    navigator.locks.request(clientId, async () => {
      console.log("unregisterClient", clientId);
      this.clients.delete(clientId);
    });
  }

  private broadcastEcho(message: string): void {
    this.clients.forEach(({ clientId, onEcho }) => {
      if (!onEcho) return;
      console.log("broadcastEcho", clientId, message);
      onEcho?.(message);
    });
  }
}

declare const self: SharedWorkerGlobalScope;

const worker = new EchoWorker();

self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  Comlink.expose(worker, port);
});
