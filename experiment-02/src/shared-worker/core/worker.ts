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

export abstract class BaseWorker {
  protected clients: Map<string, ClientRep> = new Map();

  async registerClient(clientId: string, correlationId: string): Promise<void> {
    if (this.clients.has(clientId)) return;
    console.log("registerClient", clientId, correlationId);
    this.clients.set(clientId, createClientRep(clientId));
    navigator.locks.request(clientId, async () => {
      this.unregisterClient(clientId);
    });
  }

  private unregisterClient(clientId: string): void {
    console.log("unregisterClient", clientId);
    const client = this.clients.get(clientId);
    if (!client) {
      console.warn(`Attempted to unregister unknown client: ${clientId}`);
      return;
    }
    client.allSubscriptions.unsubscribe();
    client.eachSubscription.clear();
    this.clients.delete(clientId);
  }

  protected subscribe<T>(
    clientId: string,
    correlationId: string,
    callback: (value: T) => void,
    source$: Observable<T>
  ): void {
    const client = this.getClient(clientId);
    const subscription = source$.subscribe(callback);
    client.eachSubscription.set(correlationId, subscription);
    client.allSubscriptions.add(subscription);
  }

  protected unsubscribe(clientId: string, correlationId: string): void {
    const client = this.getClient(clientId);
    const subscription = client.eachSubscription.get(correlationId);
    if (!subscription) return;
    subscription.unsubscribe();
    client.allSubscriptions.remove(subscription);
    client.eachSubscription.delete(correlationId);
  }

  protected getClient(clientId: string): ClientRep {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Unknown client ${clientId}`);
    }
    return client;
  }
}
