# Client Lifecycle and Resource Management

## Overview

This document describes the proper lifecycle management of SharedWorker clients using Comlink, including callback proxy handling and resource cleanup.

## Client Disposal

### `client.dispose()` API

All clients extending `WorkerProxy` have a `dispose()` method that should be called when the client is no longer needed:

```typescript
const client = await createClient({
  worker: new SharedWorker(...),
  Client: EchoClient,
});

// Use the client...
await client.echo("Hello");

// When done, dispose of the client
client.dispose();
```

### What `dispose()` Does

1. **Cancels active subscriptions**: All subscription callbacks are automatically unsubscribed
2. **Releases Comlink proxy**: Calls `proxy[Comlink.releaseProxy]()` to free resources
3. **Clears subscription tracking**: Removes all tracked subscription cleanup functions

## Callback Proxy Lifecycle

### Automatic Management

The framework automatically handles callback proxy lifecycle for subscriptions:

```typescript
// This callback is automatically wrapped with Comlink.proxy()
const unsubscribe = await client.subscribeEcho((message) => {
  console.log("Received:", message);
});

// The returned unsubscribe function is also a Comlink proxy
// It's automatically tracked and will be called during dispose()
```

### Subscription Tracking

- Each subscription is automatically tracked in `activeSubscriptions`
- When `dispose()` is called, all tracked subscriptions are cancelled
- Individual unsubscribe calls remove themselves from tracking

### Manual Unsubscribe Safety

```typescript
const unsubscribe = await client.subscribeEcho(callback);

// Safe to call manually - removes from tracking and calls worker unsubscribe
unsubscribe();

// Later calling dispose() won't attempt to call this unsubscribe again
client.dispose();
```

## Resource Management Best Practices

### 1. Always Dispose Clients

```typescript
// Good: Explicit disposal
const client = await getEchoClient();
try {
  // Use client...
} finally {
  client.dispose();
}

// Better: Use with cleanup in useEffect
useEffect(() => {
  let client: EchoClient;

  const initClient = async () => {
    client = await getEchoClient();
    // Use client...
  };

  initClient();

  return () => {
    client?.dispose();
  };
}, []);
```

### 2. Handle Long-lived Subscriptions

```typescript
const client = await getEchoClient();

// Long-lived subscription
const unsubscribe = await client.subscribeEcho((msg) => {
  // Handle message...
});

// Keep reference for manual cleanup if needed
// Or rely on dispose() to clean up automatically
```

### 3. Avoid Memory Leaks

- Always call `dispose()` when clients are no longer needed
- Don't manually call `releaseProxy()` on callback proxies - the framework handles this
- Subscription callbacks should not hold strong references to disposed clients

## Error Handling During Disposal

The `dispose()` method is designed to be safe to call multiple times and handles errors gracefully:

```typescript
client.dispose(); // First call - performs cleanup
client.dispose(); // Subsequent calls - safe no-ops

// If a subscription fails to unsubscribe, it logs a warning but continues
// disposing other resources
```

## Threading and Concurrency

- `dispose()` is not thread-safe with respect to new subscriptions
- Avoid calling subscription methods while `dispose()` is running
- The underlying Comlink proxy becomes unusable after `dispose()`

## Debugging

If you need to debug subscription lifecycle:

```typescript
// Check active subscription count (for debugging)
console.log("Active subscriptions:", client.activeSubscriptions?.size);
```

Note: `activeSubscriptions` is a protected property and not part of the public API.
