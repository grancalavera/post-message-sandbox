# experiment-06: Derived Clients

## Overview

Demonstrates how to derive any client implementation from a base Comlink proxy using JavaScript Proxy patterns. This experiment builds on experiment-03's SharedWorker architecture and experiment-05's proxy injection techniques to create a flexible system for generating specialized client interfaces.

## Problem Statement

In experiment-03, we established a robust SharedWorker + Comlink RPC pattern with type-safe contracts. However, different parts of an application often need different views or behaviors of the same underlying service:

- **Admin clients** that need access to diagnostic methods
- **Read-only clients** for display components that shouldn't mutate state
- **Cached clients** that automatically memoize expensive operations
- **Logged clients** that automatically track usage metrics
- **Scoped clients** that operate on specific data subsets

Creating separate services for each variation leads to code duplication and maintenance overhead. Instead, we can derive specialized clients from a base implementation.

## Approach

### Building on Previous Experiments

**From experiment-03**: We use the established SharedWorker architecture with:

- Type-safe contract definitions
- BaseWorker and WorkerProxy abstractions
- Client lifecycle management with dispose()
- Subscription handling

**From experiment-05**: We apply the Proxy injection pattern to:

- Automatically inject additional parameters (clientId, correlationId, scope, etc.)
- Transform method calls (add caching, logging, validation)
- Filter available methods based on client permissions
- Provide clean public interfaces that hide implementation details

### Derivation Patterns

1. **Method Filtering**

   ```typescript
   // Derive read-only client that only exposes query methods
   const readOnlyClient = deriveClient(baseClient, {
     filter: (methodName) =>
       methodName.startsWith("get") || methodName.startsWith("list"),
   });
   ```

2. **Parameter Injection**

   ```typescript
   // Derive scoped client that automatically adds scope to all calls
   const scopedClient = deriveClient(baseClient, {
     inject: { scope: "user:123" },
     transform: (methodName, args) => [
       args[0],
       { ...args[1], scope: "user:123" },
     ],
   });
   ```

3. **Behavior Enhancement**

   ```typescript
   // Derive cached client that memoizes expensive operations
   const cachedClient = deriveClient(baseClient, {
     cache: {
       methods: ["getExpensiveData", "calculateMetrics"],
       ttl: 60000, // 1 minute
     },
   });
   ```

4. **Usage Tracking**
   ```typescript
   // Derive logged client that tracks method calls
   const loggedClient = deriveClient(baseClient, {
     onBeforeCall: (methodName, args) =>
       console.log(`Calling ${methodName}`, args),
     onAfterCall: (methodName, result) =>
       analytics.track("api_call", { method: methodName }),
   });
   ```

### Type Safety

The derived clients maintain full type safety by:

- Using conditional types to filter methods based on derivation rules
- Preserving original method signatures while allowing parameter injection
- Providing compile-time errors for invalid derivations

```typescript
type ReadOnlyContract<T> = {
  [K in keyof T]: K extends `get${string}` | `list${string}` ? T[K] : never;
};

type ScopedContract<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (arg0: A[0], options: A[1] & { scope: string }) => R
    : T[K];
};
```

### Implementation Strategy

1. **Base Client Factory**: Create a standard client using experiment-03's patterns
2. **Derivation Engine**: Use experiment-05's proxy techniques to create derived clients
3. **Type System**: Ensure derived clients maintain type safety and IDE support
4. **Lifecycle Management**: Derived clients properly dispose of underlying resources
5. **Composition**: Allow multiple derivations to be composed together

### Benefits

- **Code Reuse**: Single service implementation supports multiple client variations
- **Type Safety**: Compile-time verification of derivation rules and method availability
- **Clean Interfaces**: Each client type exposes only relevant methods and properties
- **Maintainability**: Changes to base service automatically propagate to derived clients
- **Performance**: Opt-in enhancements like caching and batching only where needed
- **Security**: Method filtering prevents unauthorized access to sensitive operations

## Usage

1. Start the dev server: `npm run dev`
2. Navigate to: <http://localhost:5173/experiment-06/>
3. See examples of:
   - Read-only client derived from full admin client
   - Scoped client that automatically adds user context
   - Cached client that memoizes expensive operations
   - Logged client that tracks usage metrics
   - Composed client that combines multiple derivations

## Implementation Status

- [ ] Create base EchoService client using experiment-03 patterns
- [ ] Implement `deriveClient()` function using experiment-05 proxy techniques
- [ ] Add method filtering derivation (read-only clients)
- [ ] Add parameter injection derivation (scoped clients)
- [ ] Add caching derivation with TTL support
- [ ] Add logging/analytics derivation
- [ ] Create type definitions for all derivation patterns
- [ ] Implement client composition (multiple derivations)
- [ ] Add proper lifecycle management for derived clients
- [ ] Create demo UI showing all derivation patterns
