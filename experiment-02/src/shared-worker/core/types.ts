import * as Comlink from "comlink";

export type ClientConstructor<TContract> = new (
  port: MessagePort,
  clientId: string
) => TContract;

export type WorkerContract<T> = {
  [K in keyof T]: T[K] extends (...args: infer P) => infer R
    ? (id: string, ...args: P) => R
    : never;
};

export type RemoteWorker<T> = Comlink.Remote<WorkerContract<T>>;

export interface ClientRegistryContract {
  /**
   * Registers the client. Assumes internally an unique client ID is generated.
   */
  registerClient(): Promise<void>;
}
