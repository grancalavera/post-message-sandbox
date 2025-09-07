import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import type { Operations, ProxyMarkedFunction, WorkerContract } from "./model";
import * as Comlink from "comlink";
import type { RegistryContract } from "./contract";

interface ClientRep {
  clientId: string;
  subscriptions: Subscription;
}

type ClientRepMap = Map<string, ClientRep>;

export type WorkerContext = {
  clients: ClientRepMap;
  createNotifier: <T>(
    source$: Subject<T> | BehaviorSubject<T>
  ) => (value: T) => T;
  createSubscriber: <T>(
    source$: Observable<T>
  ) => (
    clientId: string,
    callback: ProxyMarkedFunction<(value: T) => void>
  ) => ProxyMarkedFunction<() => void>;
};

type WorkerFactory<T extends Operations> = (
  context: WorkerContext
) => WorkerContract<T>;
type MakeNotifier = WorkerContext["createNotifier"];
type MakeSubscriber = WorkerContext["createSubscriber"];

export const createClientRep = (clientId: string): ClientRep => ({
  clientId,
  subscriptions: new Subscription(),
});

export const createNotifier: MakeNotifier =
  <T>(source$: Subject<T> | BehaviorSubject<T>) =>
  (value: T): T => {
    if (source$.observed) {
      source$.next(value);
    }
    return value;
  };

const createSubscriberMaker =
  (clients: ClientRepMap): MakeSubscriber =>
  <T>(source$: Observable<T>) =>
  (
    clientId: string,
    callback: ProxyMarkedFunction<(value: T) => void>
  ): ProxyMarkedFunction<() => void> => {
    const client = clients.get(clientId);

    if (!client) {
      throw new ReferenceError(`Unknown client ${client}`);
    }
    console.log("subscribe", client.clientId);

    const subscription = source$.subscribe(callback);
    client.subscriptions.add(subscription);

    return Comlink.proxy(() => {
      console.log("unsubscribe", client.clientId);
      subscription.unsubscribe();
      client.subscriptions.remove(subscription);
    });
  };

export const registryWorkerFactory: WorkerFactory<RegistryContract> = ({
  clients,
}) => ({
  async registerClient(clientId) {
    if (clients.has(clientId)) {
      return;
    }

    console.log("registerClient", clientId);
    clients.set(clientId, createClientRep(clientId));

    navigator.locks.request(clientId, async () => {
      console.log("unregister client", clientId);
      const client = clients.get(clientId);
      if (!client) {
        console.warn(`Attempted to unregister unknown client ${clientId}`);
        return;
      }
      client.subscriptions.unsubscribe();
      clients.delete(clientId);
    });
  },
});

export type CreateWorker = <T extends Operations>(
  factory: WorkerFactory<T>
) => WorkerContract<T>;

export const createWorkerMaker =
  (clients: ClientRepMap): CreateWorker =>
  (factory) =>
    factory({
      clients,
      createNotifier,
      createSubscriber: createSubscriberMaker(clients),
    });

export const createWorker: CreateWorker = (factory) => {
  const create = createWorkerMaker(new Map());

  const registryWorker = create(registryWorkerFactory);
  const worker = create(factory);

  return { ...worker, ...registryWorker };
};
