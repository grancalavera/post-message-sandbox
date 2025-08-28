import * as Comlink from "comlink";
import type {
  RegistryClientContract,
  RegistryWorkerContract,
} from "./contract";

export interface CreateClientOptions<TContract> {
  worker: SharedWorker;
  Client: ClientConstructor<TContract>;
  generateClientId?: () => string;
  generateCorrelationId?: () => string;
}

export type ClientConstructor<TContract> = new (
  port: MessagePort,
  clientId: string,
  getCorrelationId: () => string
) => TContract;

export abstract class WorkerProxy<T> {
  protected proxy: Comlink.Remote<T>;
  protected clientId: string;
  protected getCorrelationId: () => string;
  private activeSubscriptions: Set<() => void> = new Set();

  constructor(
    port: MessagePort,
    clientId: string,
    getCorrelationId: () => string
  ) {
    this.proxy = Comlink.wrap<T>(port);
    this.clientId = clientId;
    this.getCorrelationId = getCorrelationId;
  }

  getClientId(): string {
    return this.clientId;
  }

  protected addSubscription(unsubscribe: () => void): void {
    this.activeSubscriptions.add(unsubscribe);
  }

  protected removeSubscription(unsubscribe: () => void): void {
    this.activeSubscriptions.delete(unsubscribe);
  }

  dispose(): void {
    // Cancel all active subscriptions
    for (const unsubscribe of this.activeSubscriptions) {
      try {
        unsubscribe();
      } catch (error) {
        console.warn("Failed to unsubscribe:", error);
      }
    }
    this.activeSubscriptions.clear();

    // Release the Comlink proxy
    this.proxy[Comlink.releaseProxy]();
  }
}

class RegistryClient
  extends WorkerProxy<RegistryWorkerContract>
  implements RegistryClientContract
{
  private isRegistered = false;
  private registration: PromiseWithResolvers<void> | undefined;

  constructor(
    port: MessagePort,
    clientId: string,
    getCorrelationId: () => string = () => crypto.randomUUID()
  ) {
    super(port, clientId, getCorrelationId);
  }

  async registerClient(): Promise<void> {
    if (this.isRegistered) {
      return;
    }

    if (this.registration) {
      return this.registration.promise;
    }

    const registration = Promise.withResolvers<void>();
    this.registration = registration;

    navigator.locks.request(this.clientId, async () => {
      await this.proxy.registerClient(this.clientId, crypto.randomUUID());
      this.isRegistered = true;
      registration.resolve();
      return new Promise(() => {});
    });

    return registration.promise;
  }
}

export const createClient = async <T>(
  options: CreateClientOptions<T>
): Promise<T> => {
  const {
    worker,
    Client,
    generateClientId = () => crypto.randomUUID(),
    generateCorrelationId = () => crypto.randomUUID(),
  } = options;

  const clientId = generateClientId();
  const registryClient = new RegistryClient(
    worker.port,
    clientId,
    generateCorrelationId
  );
  await registryClient.registerClient();
  return new Client(worker.port, clientId, generateCorrelationId);
};
