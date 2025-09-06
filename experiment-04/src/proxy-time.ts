import type {
  Contract,
  ContractOperations,
  Mutation,
  Query,
  Subscription,
  WorkerContract,
} from "./shared-worker/core/types";

type CommonContract = Contract<{
  get: Query<void, string>;
  change: Mutation<void, string>;
  subscribe: Subscription<void, string>;
}>;

const target: WorkerContract<CommonContract> = {
  get: async (clientId) => `you got ${clientId}`,
  change: async (clientId) => `you changed ${clientId}`,
  subscribe: async (clientId, callback) => {
    callback(`you subscribed with ${clientId}`);
    return () => {};
  },
};

type TargetType = typeof target;
type TargetKey = keyof TargetType;

const clientId = "proxied";

const mkProxy = <T extends WorkerContract<ContractOperations>>(target: T) =>
  new Proxy(target, {
    get(t, p, r) {},
  });

const proxy = mkProxy(target);

proxy.get();
