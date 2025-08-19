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

export interface EchoContract {
  /**
   * Echoes the message back to the client.
   */
  echo(message: string): Promise<string>;
}

export type RemoteEchoContract = RemoteContract<EchoContract>;

export const wrapRemote = <T>(port: MessagePort) =>
  Comlink.wrap<RemoteContract<T>>(port);
