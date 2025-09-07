// Building blocks for RPC contracts using variadic tuple types

type ReservedMethods = "subscribe" | "getClient";

type ArgsToParams<Args> = Args extends void
  ? []
  : Args extends readonly unknown[]
    ? Args
    : [value: Args];

export type Query<Args = void, Response = void> = {
  client: (...args: ArgsToParams<Args>) => Promise<Response>;
  worker: (clientId: string, ...args: ArgsToParams<Args>) => Promise<Response>;
};

export type Mutation<Args = void, Result = void> = {
  client: (...args: ArgsToParams<Args>) => Promise<Result>;
  worker: (clientId: string, ...args: ArgsToParams<Args>) => Promise<Result>;
};

export type Subscription<Args = void, Update = void> = {
  client: (
    ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
  ) => Promise<() => void>;
  worker: (
    clientId: string,
    ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
  ) => Promise<() => void>;
};

// Utility types to extract client and worker contracts
export type ClientContract<T> = {
  [K in keyof T]: T[K] extends { client: infer Client } ? Client : never;
};

export type WorkerContract<T> = {
  [K in keyof T]: T[K] extends { worker: infer Worker } ? Worker : never;
};

// Check if T contains any reserved method names
type HasReservedMethods<T> = keyof T & ReservedMethods extends never
  ? false
  : true;

// Create a single error constraint type
type ContractConstraint<T> =
  HasReservedMethods<T> extends true
    ? `❌ Contract uses reserved method names. Reserved names cannot be used: subscribe getClient`
    : Record<string, { client: unknown } & { worker: unknown }>;

export type Contract<T extends ContractConstraint<T>> = {
  client: ClientContract<T>;
  worker: WorkerContract<T>;
};
