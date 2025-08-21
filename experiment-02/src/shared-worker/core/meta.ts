// Building blocks for RPC contracts using variadic tuple types

type ArgsToParams<Args> = Args extends void
  ? []
  : Args extends readonly unknown[]
    ? Args
    : [value: Args];

export type Query<Args = void, Response = void> = {
  client: (...args: ArgsToParams<Args>) => Promise<Response>;
  worker: (
    clientId: string,
    correlationId: string,
    ...args: ArgsToParams<Args>
  ) => Promise<Response>;
};

export type Mutation<Args = void, Result = void> = {
  client: (...args: ArgsToParams<Args>) => Promise<Result>;
  worker: (
    clientId: string,
    correlationId: string,
    ...args: ArgsToParams<Args>
  ) => Promise<Result>;
};

export type Unsubscribe = () => void;

export type Subscription<Args = void, Update = void> = {
  client: (
    ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
  ) => Unsubscribe;
  worker_subscribe: (
    clientId: string,
    correlationId: string,
    ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
  ) => void;
  worker_unsubscribe: (clientId: string, correlationId: string) => void;
};

// Utility types to extract client and worker contracts
export type ClientContract<T> = {
  [K in keyof T]: T[K] extends { client: infer Client } ? Client : never;
};

export type WorkerContract<T> = {
  [K in keyof T as T[K] extends { worker_subscribe: unknown }
    ? never
    : K]: T[K] extends { worker: infer Worker } ? Worker : never;
} & {
  [K in keyof T as T[K] extends { worker_subscribe: unknown }
    ? `${K & string}_subscribe`
    : never]: T[K] extends { worker_subscribe: infer Subscribe }
    ? Subscribe
    : never;
} & {
  [K in keyof T as T[K] extends { worker_unsubscribe: unknown }
    ? `${K & string}_unsubscribe`
    : never]: T[K] extends { worker_unsubscribe: infer Unsubscribe }
    ? Unsubscribe
    : never;
};

export type Contract<
  T extends Record<
    string,
    { client: unknown } & (
      | { worker: unknown }
      | { worker_subscribe: unknown; worker_unsubscribe: unknown }
    )
  >,
> = {
  client: ClientContract<T>;
  worker: WorkerContract<T>;
};
