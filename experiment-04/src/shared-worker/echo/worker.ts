import * as Comlink from "comlink";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";
import type { RegistryContract } from "../core/contract";
import type { ProxyMarkedFunction, WorkerContract } from "../core/model";
import type { EchoContract } from "./contract";

interface ClientRep {
  clientId: string;
  subscriptions: Subscription;
}

const createClientRep = (clientId: string): ClientRep => ({
  clientId,
  subscriptions: new Subscription(),
});

const clients: Map<string, ClientRep> = new Map();
const echo$ = new Subject<string>();

const subscribe = <T>(
  source$: Observable<T>,
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

const notify = <T>(source$: Subject<T> | BehaviorSubject<T>, value: T): T => {
  if (source$.observed) {
    source$.next(value);
  }
  return value;
};

export const registryWorker: WorkerContract<RegistryContract> = {
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
};

export const echoWorker: WorkerContract<EchoContract> = {
  async echo(clientId, message) {
    console.log("echo", { clientId, message });
    return notify(echo$, message);
  },

  async subscribeEcho(clientId, callback) {
    console.log("subscribeEcho", { clientId });
    return subscribe(echo$, clientId, callback);
  },
};
