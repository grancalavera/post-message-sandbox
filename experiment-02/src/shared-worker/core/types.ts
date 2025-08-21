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

export type RemoteService<T> = Comlink.Remote<RemoteContract<T>>;

export interface ClientRegistryContract {
  /**
   * Registers the client. Assumes internally an unique client ID is generated.
   */
  registerClient(): Promise<void>;
}
