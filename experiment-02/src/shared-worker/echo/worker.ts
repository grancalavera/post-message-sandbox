import * as Comlink from "comlink";
import { BaseWorker, createClientRep, type WithClientId } from "../core/worker";
import type { EchoContract } from "./contract";
import type { ClientRegistryContract, WorkerContract } from "../core/types";

interface EchoClientRep extends WithClientId {
  onEcho?: (message: string) => void;
}

class EchoWorker
  extends BaseWorker<EchoClientRep>
  implements WorkerContract<EchoContract & ClientRegistryContract>
{
  constructor() {
    super(createClientRep);
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

  private broadcastEcho(message: string): void {
    this.clients.forEach((client) => {
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
