# Subscription Tracking Analysis

## Problem: Redundant Client-Side Tracking

The current implementation in experiment-03 has unnecessary duplication of subscription management between client and worker.

## Current Architecture (experiment-03)

### Client-side (`client.ts`)

```typescript
class WorkerProxy<T> {
  private activeSubscriptions: Set<() => void> = new Set(); // ❌ Redundant

  protected addSubscription(unsubscribe: () => void): void; // ❌ Manual tracking
  protected removeSubscription(unsubscribe: () => void): void;

  dispose(): void {
    // Calls all tracked unsubscribe functions
    for (const unsubscribe of this.activeSubscriptions) {
      unsubscribe(); // ❌ Duplicates worker cleanup
    }
  }
}
```

### Worker-side (`worker.ts`)

```typescript
interface ClientRep {
  eachSubscription: Map<string, Subscription>; // ✅ Already tracking
  allSubscriptions: Subscription; // ✅ Already handles cleanup
}

// ✅ Automatic cleanup via Web Locks API
navigator.locks.request(clientId, async () => {
  client.allSubscriptions.unsubscribe();
  client.eachSubscription.clear();
  this.clients.delete(clientId);
});
```

## Cleaner Architecture (experiment-02)

### Client-side (`client.ts`)

```typescript
abstract class WorkerProxy<T> {
  protected proxy: Comlink.Remote<T>;
  // ✅ No subscription tracking - worker handles it
  // ✅ No dispose() method - Web Locks handle cleanup
}
```

### Worker-side (`worker.ts`)

```typescript
// ✅ Same as experiment-03 - single source of truth for subscriptions
// ✅ Web Locks API automatically cleans up when client disconnects
```

## Why Client Tracking is Unnecessary

1. **Worker Already Manages Everything**
   - `ClientRep` tracks all subscriptions per client
   - Web Locks API automatically triggers cleanup when client disconnects
   - RxJS composite subscription handles bulk unsubscription

2. **Double Cleanup Problem**
   - Client `dispose()` calls worker unsubscribe functions
   - Worker also cleans up the same subscriptions via Web Locks
   - Creates race conditions and redundant work

3. **Manual Burden**
   - Subclasses must remember to call `addSubscription()`
   - Easy to forget, leading to memory leaks
   - Adds complexity with no benefit

4. **Comlink Handles Proxy Cleanup**
   - Only real client-side cleanup needed is `proxy[Comlink.releaseProxy]()`
   - Everything else should be delegated to the worker

## Recommended Approach

**Client is just a proxy** - let the worker handle subscription lifecycle:

```typescript
// ✅ Simple client - no subscription tracking
abstract class WorkerProxy<T> {
  protected proxy: Comlink.Remote<T>;

  // Worker handles all subscription cleanup via Web Locks
  // Client only needs to release Comlink proxy if desired
}
```

## Conclusion

The **experiment-02 approach is correct**. Client-side subscription tracking in experiment-03 is redundant overhead that duplicates what the worker already handles efficiently via Web Locks API.
