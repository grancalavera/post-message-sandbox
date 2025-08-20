import * as Comlink from "comlink";

export type ServiceConstructor<TContract> = new (
  port: MessagePort,
  clientId: string,
) => TContract;

export type RemoteContract<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (id: string, ...args: P) => R
    : never;
};
export abstract class BaseService<T> {
  protected remote: RemoteService<T>;
  protected clientId: string;
  constructor(port: MessagePort, clientId: string) {
    this.remote = remoteService<T>(port);
    this.clientId = clientId;
  }
}

export interface ClientRegistryContract {
  /**
   * Registers the client. Assumes internally an unique client ID is generated.
   */
  registerClient(): Promise<void>;
}

const remoteService = <T>(port: MessagePort): RemoteService<T> =>
  Comlink.wrap<RemoteContract<T>>(port);

export type RemoteService<T> = Comlink.Remote<RemoteContract<T>>;

class ClientRegistryService
  extends BaseService<ClientRegistryContract>
  implements ClientRegistryContract
{
  private isRegistered = false;
  private registration: PromiseWithResolvers<void> | undefined;

  constructor(port: MessagePort, clientId: string) {
    super(port, clientId);
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
      await this.remote.registerClient(this.clientId);
      this.isRegistered = true;
      registration.resolve();
      return new Promise(() => {});
    });

    return registration.promise;
  }
}

export const createSharedWorkerService = async <T>(
  worker: SharedWorker,
  Service: ServiceConstructor<T>,
  getClientId = () => crypto.randomUUID(),
): Promise<T> => {
  const clientId = getClientId();
  const registryService = new ClientRegistryService(worker.port, clientId);
  await registryService.registerClient();
  return new Service(worker.port, clientId);
};
