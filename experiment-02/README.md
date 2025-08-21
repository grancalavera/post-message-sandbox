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

**Code Restructuring Tasks:**

- [ ] Move core types from `rpc/service.ts` to `shared-worker/core/types.ts`
- [ ] Move client utilities from `rpc/service.ts` to `shared-worker/core/client.ts`
- [ ] Extract reusable worker utilities to `shared-worker/core/worker.ts`
- [ ] Move EchoContract from `rpc/model.ts` to `shared-worker/echo/contract.ts`
- [ ] Create `shared-worker/echo/client.ts` implementation
- [ ] Move echo worker implementation to `shared-worker/echo/worker.ts`
- [ ] Create `shared-worker/echo/index.ts` public API
- [ ] Update all imports throughout the experiment to use new structure
- [ ] Remove old `rpc/` directory files after restructuring

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
