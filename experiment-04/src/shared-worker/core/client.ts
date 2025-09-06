import * as Comlink from "comlink";
import type { Contract, ContractOperations, WorkerContract } from "./types";
import type { RegistryContract } from "./contract";

export interface CreateClientOptions<T extends ContractOperations> {
  worker: SharedWorker;
  Client: ClientConstructor<T>;
  generateClientId?: () => string;
}

export type ClientConstructor<T extends ContractOperations> = new (
  proxy: Comlink.Remote<WorkerContract<T>>,
  clientId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => T;

export abstract class WorkerProxy<T extends ContractOperations> {
  protected proxy: Comlink.Remote<WorkerContract<T>>;
  protected clientId: string;

  constructor(proxy: Comlink.Remote<WorkerContract<T>>, clientId: string) {
    this.proxy = proxy;
    this.clientId = clientId;
  }

  getClientId(): string {
    return this.clientId;
  }
}

class RegistryClient
  extends WorkerProxy<RegistryContract>
  implements RegistryContract
{
  private isRegistered = false;
  private registration: PromiseWithResolvers<void> | undefined;

  constructor(
    proxy: Comlink.Remote<WorkerContract<RegistryContract>>,
    clientId: string
  ) {
    super(proxy, clientId);
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
      await this.proxy.registerClient(this.clientId);
      this.isRegistered = true;
      registration.resolve();
      return new Promise(() => {});
    });

    return registration.promise;
  }
}

export const createClient = async <T extends ContractOperations>(
  options: CreateClientOptions<T>
): Promise<T> => {
  const {
    worker,
    Client,
    generateClientId = () => crypto.randomUUID(),
  } = options;

  const clientId = generateClientId();
  const proxy = Comlink.wrap<WorkerContract<T>>(worker.port);
  const registryClient = new RegistryClient(worker.port, clientId);
  await registryClient.registerClient();
  return new Client(worker.port, clientId);
};
