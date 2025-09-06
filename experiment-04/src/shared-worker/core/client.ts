import * as Comlink from "comlink";
import type { RegistryContract } from "./contract";
import type { ComlinkProxy, Operations } from "./model";

export interface CreateClientOptions {
  worker: SharedWorker;
  generateClientId?: () => string;
}

class RegistryClient implements RegistryContract {
  private isRegistered = false;
  private registration: PromiseWithResolvers<void> | undefined;
  private proxy: ComlinkProxy<RegistryContract>;
  private clientId: string;

  constructor(proxy: ComlinkProxy<RegistryContract>, clientId: string) {
    this.proxy = proxy;
    this.clientId = clientId;
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

export const createClient = async <T extends Operations>(
  options: CreateClientOptions
): Promise<T> => {
  const { worker, generateClientId = () => crypto.randomUUID() } = options;

  const clientId = generateClientId();

  const registryClient = new RegistryClient(
    Comlink.wrap(worker.port),
    clientId
  );
  await registryClient.registerClient();

  throw new Error("not fully implemented yet");
};
