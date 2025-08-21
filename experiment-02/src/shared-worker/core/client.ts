import * as Comlink from "comlink";
import type {
  ServiceConstructor,
  RemoteContract,
  RemoteService,
  ClientRegistryContract,
} from "./types";

const remoteService = <T>(port: MessagePort): RemoteService<T> =>
  Comlink.wrap<RemoteContract<T>>(port);

export abstract class BaseService<T> {
  protected remote: RemoteService<T>;
  protected clientId: string;
  constructor(port: MessagePort, clientId: string) {
    this.remote = remoteService<T>(port);
    this.clientId = clientId;
  }

  getClientId(): string {
    return this.clientId;
  }
}

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
