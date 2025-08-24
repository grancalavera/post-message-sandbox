# experiment-02: client registration

## Overview

This experiment demonstrates a type-safe RPC system using Comlink with SharedWorkers for client registration and service communication. The goal is to create a pattern where multiple browser tabs can register with a shared worker and communicate through well-defined service contracts.

## Implementation

This experiment demonstrates how to use Comlink for SharedWorker-based RPC communication with automatic client registration and teardown using the Web Locks API.

**Key Features:**

- Type-safe RPC contracts with automatic client ID injection
- Cross-tab communication through subscription-based broadcasting
- Automatic client lifecycle management using Web Locks API
- Generic service factory pattern for extensible service architectures

**Client Teardown Strategy:**
The system uses Web Locks API for automatic client lifecycle management:

- **Client-side**: Each client holds a web lock using their unique client ID as the lock name
- **Worker-side**: The worker periodically attempts to acquire the same locks to detect disconnected clients
- **Detection mechanism**: If the worker successfully acquires a client's lock, it means that client has disconnected (tab closed)
- **Cleanup**: Worker removes disconnected clients from registry and immediately releases the acquired lock

**Progress:**

- [x] Type-safe RPC contract definitions with `RemoteContract<T>` pattern
- [x] Client registration system with unique ID generation
- [x] SharedWorker implementation that manages client registry
- [x] Generic service factory for creating SharedWorker-backed services
- [x] Echo service as proof-of-concept RPC contract
- [x] Proper TypeScript configuration for WebWorker support
- [x] Remote echo service implementation in SharedWorker
- [x] Client teardown using web locks (client-side implementation)
- [x] Worker-side lock monitoring for client cleanup
- [x] Frontend UI to demonstrate client registration and echo functionality
- [x] Multi-tab communication with subscription-based broadcasting
- [x] Echo service subscription system for cross-tab messaging
- [x] An UI explaining how the experiment works and demonstrates subscriptions and request response. Don't add anything to the RPC layer.

## Code Organization

The experiment follows a modular structure for the SharedWorker RPC system:

```
src/shared-worker/
├── core/
│   ├── types.ts          // Core types like RemoteContract, ServiceConstructor
│   ├── client.ts         // Client-side framework utilities
│   └── worker.ts         // Worker-side framework utilities
└── echo/
    ├── index.ts          // Public API export
    ├── client.ts         // EchoClient implementation
    ├── worker.ts         // EchoWorker implementation
    └── contract.ts       // EchoContract interface
```

**Design Principles:**

- **Framework vs Implementation**: `core/` contains reusable utilities, `echo/` contains contract-specific logic
- **Runtime Separation**: Clear distinction between client-side and worker-side code
- **Public APIs**: Each service exposes a clean interface through `index.ts`
- **Type Safety**: Full TypeScript support with contract-based type transformations

## Usage

1. Start the dev server: `npm run dev`
2. Navigate to: <http://localhost:5173/experiment-02/>
3. **Request-Response Demo:**
   - Enter a custom message in the input field
   - Click "Send Echo Request" to test RPC calls
   - View responses in the Response Log panel
4. **Subscription Demo:**
   - Click "Subscribe to Echo Messages" to enable cross-tab communication
   - Open multiple tabs with the same experiment
   - Send echo requests from any tab and watch messages appear in all subscribed tabs
5. **Multi-Tab Testing:**
   - Open the experiment in multiple browser tabs
   - Subscribe to messages in each tab
   - Send requests from different tabs to see real-time broadcasting
   - Close tabs to observe automatic client cleanup via Web Locks API
6. **Debugging:** Check browser console for additional client registration and worker lifecycle logging

## Materialized Notifications

Use the concept of materialized notifications to be able to encode errors.

```typescript
interval(1000).pipe(
  materialize(),
  tap((notification) => {
    console.log("Notification:", notification);
  })
);
```

## API Developer Experience Review

This review focuses on the developer experience of the SharedWorker + Comlink RPC API in experiment-02, with attention to ergonomics, safety, and portability.

### Summary

- The core abstractions (Contract types, WorkerProxy, BaseWorker, SharedWorker runtime) are well-designed and type-safe.
- Comlink and SharedWorker are used correctly; subscriptions and client lifecycle are thoughtfully handled with Web Locks.
- The largest DX opportunities are: client creation ergonomics, lifecycle/disposal APIs, standardized error/cancellation, multi-service factory, subscription convenience helpers, and portability fallbacks.

### What’s working well

- Type-safe contract pattern
  - Query/Mutation/Subscription map cleanly to client vs worker signatures, auto-injecting clientId and correlationId on the worker side while keeping the client API clean.
  - Reserved method name guard prevents accidental API shape conflicts.
- Separation of concerns
  - core/ is framework code; echo/ demonstrates a concrete service. This makes it easy to author new services.
- Lifecycle and broadcast
  - BaseWorker maintains a client registry and subscription bookkeeping, with reliable cleanup on unregister.
  - Web Locks usage is appropriate for auto-detecting closed tabs and fits MDN’s advanced usage pattern.
- Comlink alignment
  - SharedWorker usage follows the official pattern (wrap port on the client; expose within onconnect using event.ports[0]).
  - Callbacks are proxied correctly with Comlink.proxy, and unsubscribe functions returned from the worker are proxied back.

### DX friction and opportunities

- Client creation ergonomics
  - createClient(worker, Client, getRandomId?) couples clientId and correlationId generation to a single function and relies on top-level await in echo/index.ts.
  - Consider an options object for clarity and future extensibility:
    - { worker, Client, generateClientId, generateCorrelationId, name, debug }
  - Prefer a factory like getEchoClient(options?) that can lazily/caching-instantiate clients instead of top-level await exports, which complicate SSR and error handling.

- Multi-service scale story
  - For apps with multiple services, provide a “service factory” that:
    - Initializes one SharedWorker instance and returns typed clients for multiple contracts.
    - Optionally uses Comlink.createEndpoint to fan out ports when needed.
    - Offers a single place to enable diagnostics and logging.

- Subscription ergonomics
  - Many devs prefer RxJS Observables on the client. Provide a helper that turns subscribeEcho(cb) into an Observable whose unsubscribe calls the worker’s returned unsubscribe.
  - This aligns with the “materialized notifications” approach mentioned in this README and makes client code more composable.

- Error handling and cancellation
  - Standardize on a Result<T, E> or discriminated union for RPC calls to avoid ad-hoc error shapes and to enable typed UI handling.
  - Add an optional RequestContext (e.g., { correlationId, timeoutMs, metadata }) to all operations if you plan to add timeouts/logging consistently.

- Lifecycle and resource management
  - Provide a client.dispose() API to:
    - Release the underlying Comlink proxy (proxy[Comlink.releaseProxy]()).
    - Cancel all active client-side subscriptions in one call.
  - Document callback proxy lifecycle and when it’s safe to release.

- Logging and diagnostics
  - Add a debug flag to control console logging in both client and worker.
  - Optional diagnostics endpoints (e.g., getClients(), getSubscriptions(clientId)) behind a debug flag are very helpful during development without affecting prod.

- Naming and docs consistency
  - The “Code Organization” section lists core/types.ts but the actual file is core/meta.ts. Align the file name or the docs to avoid confusion.
  - Document the reserved-method policy prominently (subscribe and getClient are reserved) in a short “Contract authoring guide” section.

- API cohesion/discoverability
  - Provide a scaffold (via the workbench tool) for new services: contract.ts, client.ts, worker.ts, worker-runtime.ts, index.ts pre-wired to BaseWorker and WorkerProxy. This makes adding services fast and consistent.
  - Consider encouraging a single structured argument object for operations to enable easier evolution of parameters without breaking callers.

### Portability and feature detection

- SharedWorker support
  - Desktop: Chrome/Edge/Firefox/Safari (recent) support SharedWorker.
  - Mobile: Support is limited (e.g., Chrome for Android lacks it). Consider feature detection with a DX-friendly fallback (DedicatedWorker, same-tab worker, or an explanatory error UI).

- Web Locks API
  - Supported in workers and across modern browsers. If absent, a heartbeat-based cleanup or a “no-op auto-cleanup” mode can keep the demo functional with a clear warning to developers.

### Security considerations

- Comlink.expose defaults to allowing all origins. For a production library, consider allowedOrigins or an origin check on connection in the SharedWorker runtime.

### Prioritized recommendations

1. Client initialization ergonomics
   - Replace createClient(worker, Client, getRandomId?) with an options object:
     - createClient({ worker, Client, generateClientId, generateCorrelationId, name, debug })
   - Provide getEchoClient(options?) that manages creation/caching and avoids top-level await in consumers.

2. Multi-service worker and discoverability
   - Provide a ServiceFactory abstraction to manage a single SharedWorker instance and return typed clients for multiple services, with optional diagnostics.

3. Subscription convenience
   - Add client-side helpers to expose RxJS Observables for subscriptions, ensuring unsubscribe calls the worker’s unsubscribe function.
   - Optionally materialize/dematerialize events to encode completion and errors explicitly.

4. Error/cancellation standardization
   - Use a consistent Result<T, E> or discriminated union for RPC responses.
   - Consider a RequestContext parameter to enable timeouts and structured logging.

5. Lifecycle/dispose
   - Add client.dispose() to release the Comlink proxy and cancel all subscriptions.
   - Document callback proxy lifecycle (including when and whether to call releaseProxy on callback proxies).

6. Feature detection and fallback
   - Detect SharedWorker and navigator.locks with a DX-friendly fallback or clear guidance when unsupported.

7. Docs and naming
   - Fix the “types.ts” reference to “meta.ts” in the “Code Organization” section.
   - Add a short “Authoring a new service” guide and a “Reserved method names” note for contract authors.

### References

- Comlink SharedWorker pattern and API (wrap port; expose within onconnect)
- Comlink callbacks and releaseProxy discussion: “Q: Should I release proxy()-wrapped callbacks?” (issue #590)
- MDN Web Locks API: supported in workers; advanced usage pattern with Promise.withResolvers
- SharedWorker support: good on modern desktop; limited on mobile (see caniuse: Shared Web Workers)
- Promise.withResolvers: Baseline 2024, broadly available
