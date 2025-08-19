import * as Comlink from "comlink";

export type ServiceConstructor<TContract> = new (
  remote: Comlink.Remote<RemoteContract<TContract>>,
  clientId: string
) => TContract;

export type RemoteContract<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (id: string, ...args: P) => R
    : never;
};

export interface ClientRegistryContract {
  /**
   * Registers the client. Assumes internally an unique client ID is generated.
   */
  registerClient(): Promise<void>;
}

export const wrapRemote = <T>(port: MessagePort): RemoteService<T> =>
  Comlink.wrap<RemoteContract<T>>(port);

export type RemoteService<T> = Comlink.Remote<RemoteContract<T>>;

class ClientRegistryService implements ClientRegistryContract {
  private remote: Comlink.Remote<RemoteContract<ClientRegistryContract>>;
  private clientId = crypto.randomUUID();

  constructor(remote: Comlink.Remote<RemoteContract<ClientRegistryContract>>) {
    this.remote = remote;
  }

  async registerClient(): Promise<void> {
    await this.remote.registerClient(this.clientId);
  }

  getClientId(): string {
    return this.clientId;
  }
}

export abstract class BaseService<T> {
  protected remote: RemoteService<T>;
  protected clientId: string;

  constructor(remote: RemoteService<T>, clientId: string) {
    this.remote = remote;
    this.clientId = clientId;
  }
}

export const createSharedWorkerService = async <T>(
  Service: ServiceConstructor<T>
): Promise<T> => {
  const worker = new SharedWorker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });

  const registryService = new ClientRegistryService(
    wrapRemote<ClientRegistryContract>(worker.port)
  );

  await registryService.registerClient();

  return new Service(wrapRemote<T>(worker.port), registryService.getClientId());
};
