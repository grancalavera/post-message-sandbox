import * as Comlink from "comlink";
import type {
  ClientConstructor,
  RegistryClientContract,
  RegistryWorkerContract,
} from "./types";
import type { Unsubscribe } from "./meta";

const portToWorkerProxy = <T>(port: MessagePort): Comlink.Remote<T> =>
  Comlink.wrap<T>(port);

type SubscribeMethod<T> = (
  clientId: string,
  correlationId: string,
  callback: Callback<T>
) => void;

type UnsubscribeMethod = (clientId: string, correlationId: string) => void;

type Callback<T> = (value: T) => void;

export abstract class WorkerProxy<T> {
  protected proxy: Comlink.Remote<T>;
  protected clientId: string;
  protected getCorrelationId: () => string;

  constructor(
    port: MessagePort,
    clientId: string,
    getCorrelationId: () => string
  ) {
    this.proxy = portToWorkerProxy<T>(port);
    this.clientId = clientId;
    this.getCorrelationId = getCorrelationId;
  }

  getClientId(): string {
    return this.clientId;
  }

  protected subscribe<TValue>(
    subscribeMethod: SubscribeMethod<TValue>,
    unsubscribeMethod: UnsubscribeMethod,
    callback: Callback<TValue>
  ): Unsubscribe {
    const correlationId = this.getCorrelationId();
    subscribeMethod.call(
      this.proxy,
      this.clientId,
      correlationId,
      Comlink.proxy(callback)
    );
    return () => {
      unsubscribeMethod.call(this.proxy, this.clientId, correlationId);
    };
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
    getCorrelationId = () => crypto.randomUUID()
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
  worker: SharedWorker,
  Service: ClientConstructor<T>,
  getRandomId = () => crypto.randomUUID()
): Promise<T> => {
  const clientId = getRandomId();
  const registryClient = new RegistryClient(worker.port, clientId, getRandomId);
  await registryClient.registerClient();
  return new Service(worker.port, clientId, getRandomId);
};
