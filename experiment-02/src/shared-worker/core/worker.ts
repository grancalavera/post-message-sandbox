import * as Comlink from "comlink";
import { Observable, Subscription } from "rxjs";

interface ClientRep {
  clientId: string;
  eachSubscription: Map<string, Subscription>;
  allSubscriptions: Subscription;
}

const createClientRep = (clientId: string): ClientRep => ({
  clientId,
  eachSubscription: new Map(),
  allSubscriptions: new Subscription(),
});

/**
 * Prevents sub-classes from overriding the subscribe method.
 */
export const subscribeMethod = Symbol("subscribe");

/**
 * Prevents sub-classes from overriding the getClient method.
 */
const getClientMethod = Symbol("getClient");

export abstract class BaseWorker {
  protected clients: Map<string, ClientRep> = new Map();

  async registerClient(clientId: string, correlationId: string): Promise<void> {
    if (this.clients.has(clientId)) return;
    console.log("registerClient", clientId, correlationId);
    this.clients.set(clientId, createClientRep(clientId));

    navigator.locks.request(clientId, async () => {
      console.log("unregisterClient", clientId);
      const client = this.clients.get(clientId);
      if (!client) {
        console.warn(`Attempted to unregister unknown client: ${clientId}`);
        return;
      }
      client.allSubscriptions.unsubscribe();
      client.eachSubscription.clear();
      this.clients.delete(clientId);
    });
  }

  protected async [subscribeMethod]<T>(
    clientId: string,
    correlationId: string,
    callback: (value: T) => void,
    source$: Observable<T>
  ): Promise<() => void> {
    const client = this[getClientMethod](clientId);
    const subscription = source$.subscribe(callback);
    client.eachSubscription.set(correlationId, subscription);
    client.allSubscriptions.add(subscription);

    return Comlink.proxy(() => {
      const subscription = client.eachSubscription.get(correlationId);
      if (!subscription) return;
      console.log("unsubscribe", clientId, correlationId);
      subscription.unsubscribe();
      client.allSubscriptions.remove(subscription);
      client.eachSubscription.delete(correlationId);
    });
  }

  private [getClientMethod](clientId: string): ClientRep {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Unknown client ${clientId}`);
    }
    return client;
  }
}
