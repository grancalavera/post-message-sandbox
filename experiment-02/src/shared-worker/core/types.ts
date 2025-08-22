import * as Comlink from "comlink";
import type { Contract, Mutation } from "./meta";

export type ClientConstructor<TContract> = new (
  port: MessagePort,
  clientId: string,
  getCorrelationId: () => string
) => TContract;

export type RemoteWorker<T> = Comlink.Remote<T>;

type RegistryContract = Contract<{
  registerClient: Mutation;
}>;

export type RegistryWorkerContract = RegistryContract["worker"];
export type RegistryClientContract = RegistryContract["client"];
