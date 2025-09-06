type ArgsToParams<Args> = Args extends void
  ? []
  : Args extends readonly unknown[]
    ? Args
    : [value: Args];

export type Query<Args = void, Response = void> = {
  (...args: ArgsToParams<Args>): Promise<Response>;
};

export type Mutation<Args = void, Result = void> = {
  (...args: ArgsToParams<Args>): Promise<Result>;
};

export type Subscription<Args = void, Update = void> = {
  (
    ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
  ): Promise<() => void>;
};

export type ContractOperations = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query<any, any> | Mutation<any, any> | Subscription<any, any>
>;

export type IndexedOperations<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? (clientId: string, ...args: Args) => Return
    : T[K];
};

export type Contract<T extends ContractOperations> = T;
export type WorkerContract<T extends ContractOperations> = IndexedOperations<T>;
