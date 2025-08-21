import * as Comlink from "comlink";
import type {
  ClientConstructor,
  RegistryClientContract,
  RegistryWorkerContract,
} from "./types";

const portToRemote = <T>(port: MessagePort): Comlink.Remote<T> =>
  Comlink.wrap<T>(port);

export abstract class BaseClient<T> {
  protected remote: Comlink.Remote<T>;
  protected clientId: string;
  constructor(port: MessagePort, clientId: string) {
    this.remote = portToRemote<T>(port);
    this.clientId = clientId;
  }

  getClientId(): string {
    return this.clientId;
  }
}

class RegistryClient
  extends BaseClient<RegistryWorkerContract>
  implements RegistryClientContract
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
      await this.remote.registerClient(this.clientId, crypto.randomUUID());
      this.isRegistered = true;
      registration.resolve();
      return new Promise(() => {});
    });

    return registration.promise;
  }
}

export const createClient = async <T>(
  worker: SharedWorker,
  Service: ClientConstructor<T>,
  getClientId = () => crypto.randomUUID(),
): Promise<T> => {
  const clientId = getClientId();
  const registryClient = new RegistryClient(worker.port, clientId);
  await registryClient.registerClient();
  return new Service(worker.port, clientId);
};
