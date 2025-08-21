export interface ClientRep {
  clientId: string;
}

export const clientRep = (clientId: string): ClientRep => ({ clientId });

export abstract class BaseWorker {
  protected clients: Map<string, ClientRep> = new Map();

  async registerClient(clientId: string): Promise<void> {
    if (this.clients.has(clientId)) return;

    console.log("registerClient", clientId);
    this.clients.set(clientId, clientRep(clientId));

    navigator.locks.request(clientId, async () => {
      console.log("unregisterClient", clientId);
      this.clients.delete(clientId);
    });
  }

  protected getClient(clientId: string): ClientRep {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Unknown client ${clientId}`);
    }
    return client;
  }
}
