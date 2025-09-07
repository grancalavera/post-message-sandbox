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
    a;
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
      console.log("[get]", { clientId, target, prop, receiver });

      const value = Reflect.get(target, prop, receiver);
      console.log(typeof value);

      if (typeof value === "function") {
        console.log('intercept function call for prop "', String(prop), '"');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return function (...args: any[]) {
          // const processedArgs = args.map((arg) => {
          //   if (typeof arg === "function") {
          //     console.log("intercept function argument", String(arg));
          //     return Comlink.proxy(arg);
          //   } else {
          //     return arg;
          //   }
          // });
          return value.apply(target, [clientId, ...args]);
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
