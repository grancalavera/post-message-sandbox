import * as Comlink from "comlink";
import type { RegistryContract } from "./contract";
import type { Operations, WorkerContract, WorkerProxy } from "./model";

export interface CreateClientOptions {
  sharedWorker: SharedWorker;
  generateClientId?: () => string;
}

const registerClient = async (
  workerProxy: WorkerProxy<RegistryContract>,
  clientId: string
): Promise<void> => {
  const registration = Promise.withResolvers<void>();

  navigator.locks.request(clientId, async () => {
    await workerProxy.registerClient(clientId);
    registration.resolve();
    return new Promise(() => {});
  });

  return registration.promise;
};

const deriveClient = <T extends Operations>(
  workerProxy: WorkerProxy<T>,
  clientId: string
): T =>
  new Proxy(workerProxy, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (typeof value === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return function (...args: any[]) {
          const processedArgs = args.map((arg) =>
            typeof arg === "function" ? Comlink.proxy(arg) : arg
          );

          return value.apply(target, [clientId, ...processedArgs]);
        };
      }

      return value;
    },
  }) as T;

export const createClient = async <T extends Operations>(
  options: CreateClientOptions
): Promise<T> => {
  const { sharedWorker, generateClientId = () => crypto.randomUUID() } =
    options;

  const clientId = generateClientId();

  await registerClient(Comlink.wrap(sharedWorker.port), clientId);

  return deriveClient<T>(
    Comlink.wrap<WorkerContract<T>>(sharedWorker.port),
    clientId
  );
};
