# experiment-02: client registration

## Overview

This experiment demonstrates a type-safe RPC system using Comlink with SharedWorkers for client registration and service communication. The goal is to create a pattern where multiple browser tabs can register with a shared worker and communicate through well-defined service contracts.

## Implementation

This experiment demonstrates how to use Comlink for SharedWorker-based RPC communication with automatic client registration and teardown using the Web Locks API.

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
- [ ] Remote echo service implementation in SharedWorker
- [x] Client teardown using web locks (client-side implementation)
- [ ] Worker-side lock monitoring for client cleanup
- [ ] Frontend UI to demonstrate client registration and echo functionality
- [ ] Multiple tab communication examples
- [ ] Error handling and connection management
- [ ] Service discovery mechanism for multiple service types

## Usage

1. Start the dev server: `npm run dev`
2. Navigate to: <http://localhost:5173/experiment-02/>
3. Open multiple tabs to test cross-tab communication
4. Use the echo service to send messages between clients
