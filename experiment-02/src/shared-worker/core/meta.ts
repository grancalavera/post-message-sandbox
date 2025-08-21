// Building blocks for RPC contracts using variadic tuple types

type ArgsToParams<Args> = Args extends void
  ? []
  : Args extends readonly unknown[]
    ? Args
    : never;

export type Query<
  Args extends readonly unknown[] | void = void,
  Response = void,
> = {
  client: (...args: ArgsToParams<Args>) => Promise<Response>;
  worker: (
    clientId: string,
    correlationId: string,
    ...args: ArgsToParams<Args>
  ) => Promise<Response>;
};

export type Mutation<
  Args extends readonly unknown[] | void = void,
  Result = void,
> = {
  client: (...args: ArgsToParams<Args>) => Promise<Result>;
  worker: (
    clientId: string,
    correlationId: string,
    ...args: ArgsToParams<Args>
  ) => Promise<Result>;
};

export type Unsubscribe = () => void;

export type Subscription<
  Args extends readonly unknown[] | void = void,
  Update = void,
> = {
  client: (
    ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
  ) => Unsubscribe;
  worker: {
    subscribe: (
      clientId: string,
      correlationId: string,
      ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
    ) => void;
    unsubscribe: (clientId: string, correlationId: string) => void;
  };
};

// Utility types to extract client and worker contracts
export type ClientContract<T> = {
  [K in keyof T]: T[K] extends Query<infer Args, infer Response>
    ? (...args: ArgsToParams<Args>) => Promise<Response>
    : T[K] extends Mutation<infer Args, infer Result>
      ? (...args: ArgsToParams<Args>) => Promise<Result>
      : T[K] extends Subscription<infer Args, infer Update>
        ? (
            ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
          ) => Unsubscribe
        : never;
};

export type WorkerContract<T> = {
  [K in keyof T]: T[K] extends Query<infer Args, infer Response>
    ? (
        clientId: string,
        correlationId: string,
        ...args: ArgsToParams<Args>
      ) => Promise<Response>
    : T[K] extends Mutation<infer Args, infer Result>
      ? (
          clientId: string,
          correlationId: string,
          ...args: ArgsToParams<Args>
        ) => Promise<Result>
      : T[K] extends Subscription<infer Args, infer Update>
        ? {
            subscribe: (
              clientId: string,
              correlationId: string,
              ...args: [
                ...ArgsToParams<Args>,
                callback: (result: Update) => void,
              ]
            ) => void;
            unsubscribe: (clientId: string, correlationId: string) => void;
          }
        : never;
};

// Placeholder User type for the example
export interface User {
  id: string;
  name: string;
}
// Usage examples
export interface ExampleContract {
  getFoo: Query<[query: string], number>; // single param
  getBar: Query<[query: string, limit: number, active: boolean], string>; // multiple params
  getBaz: Query<void, User[]>; // no params - using void instead of []
  updateFoo: Mutation<[value: number]>; // defaults to void result
  createUser: Mutation<[name: string, email: string], User>; // returns created user
  deleteUser: Mutation<[id: string]>; // fire-and-forget deletion
  watchFoo: Subscription<[query: string], number>; // callback gets updates
  userLoggedOut: Subscription; // notification with no params or data
  keepAlive: Mutation;
}
// Example usage
export type ExampleClientContract = ClientContract<ExampleContract>;
export type ExampleWorkerContract = WorkerContract<ExampleContract>;

// Example usage with named parameters
// declare const exampleClient: ExampleClientContract;
// declare const exampleWorker: ExampleWorkerContract;
