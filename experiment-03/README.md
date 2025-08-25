# experiment-03: API Developer Experience Review

## Implementation Checklist

### Client Creation Ergonomics

- [x] Replace `createClient(worker, Client, getRandomId?)` with options object
- [x] Use structure: `{ worker, Client, generateClientId, generateCorrelationId, name }`
- [x] Remove top-level await exports from echo/index.ts

### Lifecycle and Resource Management

- [x] Add `client.dispose()` API to release Comlink proxy
- [x] Implement `proxy[Comlink.releaseProxy]()` in dispose method
- [x] Add cancel all active client-side subscriptions functionality
- [x] Document callback proxy lifecycle and release safety

## Not yet but maybe later

- [ ] Implement subscription convenience helpers for RxJS Observables
- [ ] Add error handling standardization with Result<T, E> pattern
- [ ] Implement RequestContext parameter for timeouts and logging
- [ ] Add feature detection for SharedWorker and Web Locks API

## API Developer Experience Review

This review focuses on the developer experience of the SharedWorker + Comlink RPC API in experiment-03, with attention to ergonomics, safety, and portability.

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
