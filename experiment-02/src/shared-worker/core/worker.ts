export interface WithClientId {
  clientId: string;
}

export const createClientRep = (clientId: string): WithClientId => ({
  clientId,
});

export abstract class BaseWorker<T extends WithClientId = WithClientId> {
  protected clients: Map<string, T> = new Map();
  protected createClientRep: (clientId: string) => T;

  constructor(createClientRep: (clientId: string) => T) {
    this.createClientRep = createClientRep;
  }

  async registerClient(clientId: string): Promise<void> {
    if (this.clients.has(clientId)) return;

    console.log("registerClient", clientId);
    this.clients.set(clientId, this.createClientRep(clientId));

    navigator.locks.request(clientId, async () => {
      console.log("unregisterClient", clientId);
      this.clients.delete(clientId);
    });
  }

  protected getClient(clientId: string): T {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error(`Unknown client ${clientId}`);
    }
    return client;
  }
}
