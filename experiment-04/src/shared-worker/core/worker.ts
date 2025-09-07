import * as Comlink from "comlink";
import { Observable, Subscription } from "rxjs";
import type { ProxyMarkedFunction } from "./model";

interface ClientRep {
  clientId: string;
  subscriptions: Subscription;
}

interface WorkerContext {
  getClient: (clientId: string) => ClientRep;
  subscribe<T>(
    clientId: string,
    source$: Observable<T>,
    callback: (value: T) => void
  ): Promise<ProxyMarkedFunction<() => void>>;
}

const createClientRep = (clientId: string): ClientRep => ({
  clientId,
  subscriptions: new Subscription(),
});

export abstract class BaseWorker {
  protected clients: Map<string, ClientRep> = new Map();

  async registerClient(clientId: string): Promise<void> {
    if (this.clients.has(clientId)) return;
    console.log("registerClient", clientId);
    this.clients.set(clientId, createClientRep(clientId));

    navigator.locks.request(clientId, async () => {
      console.log("unregisterClient", clientId);
      const client = this.clients.get(clientId);
      if (!client) {
        console.warn(`Attempted to unregister unknown client: ${clientId}`);
        return;
      }
      client.subscriptions.unsubscribe();
      this.clients.delete(clientId);
    });
  }

  protected async subscribe<T>(
    clientId: string,
    callback: (value: T) => void,
    source$: Observable<T>
  ): Promise<ProxyMarkedFunction<() => void>> {
    console.log("unsubscribe", clientId);
    const client = this.getClient(clientId);
    const subscription = source$.subscribe(callback);
    client.subscriptions.add(subscription);

    return Comlink.proxy(() => {
      console.log("unsubscribe", clientId);
      subscription.unsubscribe();
      client.subscriptions.remove(subscription);
    });
  }

  private getClient(clientId: string): ClientRep {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Unknown client ${clientId}`);
    }
    return client;
  }
}
