# experiment-05: remove correlation id

## Overview

This experiment demonstrates removing correlation ID from the RPC system while maintaining type-safe communication using Comlink with SharedWorkers. The goal is to simplify the architecture by eliminating correlation tracking without losing the benefits of client registration and service communication.

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
2. Navigate to: <http://localhost:5173/experiment-05/>
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
  }),
);
```
