import * as Comlink from "comlink";

/**
 * Type helper that ensures only structured cloneable JavaScript types are allowed.
 * Based on: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types
 *
 * Supported JavaScript types:
 * - Array
 * - ArrayBuffer
 * - Boolean
 * - DataView
 * - Date
 * - Map
 * - Number (including bigint)
 * - Object (plain objects from object literals only)
 * - Primitive types (except symbol)
 * - RegExp (note: lastIndex is not preserved)
 * - Set
 * - String
 * - TypedArray (Int8Array, Uint8Array, etc.)
 */
type StructuredCloneable =
  | boolean
  | number
  | bigint
  | string
  | null
  | undefined
  | void
  | Date
  | RegExp
  | ArrayBuffer
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array
  | DataView;

/**
 * Type helper for Comlink proxy-marked functions.
 * These are functions that have been wrapped with Comlink.proxy() and can be
 * transferred across worker boundaries while maintaining their callable nature.
 */
export type ProxyMarkedFunction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => any = (...args: any[]) => any,
> = T & Comlink.ProxyMarked;

/**
 * Converts operation arguments to proper parameter format.
 * - void arguments become empty parameter array
 * - Array arguments are preserved as-is
 * - Single arguments are wrapped in an array with named parameter
 */
type ArgsToParams<Args> = Args extends void
  ? []
  : Args extends readonly unknown[]
    ? Args
    : [value: Args];

/**
 * Represents a query operation that retrieves data.
 * Returns a Promise of the response data.
 */
export type Query<
  Args extends StructuredCloneable = void,
  Response extends StructuredCloneable = void,
> = {
  (...args: ArgsToParams<Args>): Promise<Response>;
};

/**
 * Represents a mutation operation that modifies data.
 * Returns a Promise of the operation result.
 */
export type Mutation<
  Args extends StructuredCloneable = void,
  Result extends StructuredCloneable = void,
> = {
  (...args: ArgsToParams<Args>): Promise<Result>;
};

/**
 * Represents a subscription operation that receives real-time updates.
 * Takes arguments plus a callback function for updates.
 * Returns a Promise of an unsubscribe function.
 */
export type Subscription<
  Args extends StructuredCloneable = void,
  Update extends StructuredCloneable = void,
> = {
  (
    ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
  ): Promise<() => void>;
};

/**
 * A collection of operations (queries, mutations, and subscriptions)
 * mapped by their operation names.
 */
export type Operations = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query<any, any> | Mutation<any, any> | Subscription<any, any>
>;

/**
 * A contract defining the available operations for client-worker communication.
 * Simply aliases the Operations type with proper type constraints.
 */
export type Contract<T extends Operations> = T;

/**
 * Worker-side version of a contract where each operation receives
 * an additional clientId parameter as the first argument.
 * This allows the worker to identify which client is making the request.
 *
 * For subscriptions, enforces that callbacks are ProxyMarkedFunction
 * and return values are ProxyMarkedFunction wrapped in Promise.
 */
export type WorkerContract<T extends Operations> = {
  [K in keyof T]: T[K] extends Subscription<infer Args, infer Update>
    ? (
        clientId: string,
        ...args: [...ArgsToParams<Args>, callback: (value: Update) => void]
      ) => Promise<ProxyMarkedFunction<() => void>>
    : T[K] extends (...args: infer Args) => infer Return
      ? (clientId: string, ...args: Args) => Return
      : T[K];
};

/**
 * A Comlink remote proxy for a worker contract.
 * This wraps the WorkerContract type with Comlink's Remote type,
 * providing type-safe communication across the worker boundary.
 */
export type WorkerProxy<T extends Operations> = Comlink.Remote<
  WorkerContract<T>
>;
