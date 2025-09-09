# Model Notes

## Issues to Address

- missing optional parameters
- missing parameters in subscription operator
- it might be better to add proper structure to arguments to make worker implementation simpler. for example in the current form where we can pass arguments to subscriptions followed by a callback, if there's an optional argument before the callback, then the worker must implement the subscription with an overloaded function, and there are n possible overloaded functions to implement. if we pass an object instead it might be easier to handle, with the possible complication of wrapping the callback in a Comlink.proxy in our own client proxy.

## Structured Arguments for Subscriptions

### Current Problem

The current subscription signature `(...args, callback)` creates complexity when dealing with optional parameters:

```typescript
// Current approach - problematic with optional args
subscription(arg1: string, arg2?: number, callback: (value: T) => void)

// Worker must handle multiple overloads:
// subscription(arg1, callback)
// subscription(arg1, arg2, callback)
```

### Proposed Solutions

#### Option 1: Object-based Arguments

```typescript
export type Subscription<
  Args extends StructuredCloneable = void,
  Update extends StructuredCloneable = void,
> = Args extends void
  ? (callback: (value: Update) => void) => Promise<() => void>
  : (args: Args, callback: (value: Update) => void) => Promise<() => void>;

// Usage:
// subscription({ arg1: "value", arg2?: 123 }, callback)
// subscription(callback) // for void args
```

#### Option 2: Configuration Object with Callback

```typescript
export type Subscription<
  Args extends StructuredCloneable = void,
  Update extends StructuredCloneable = void,
> = Args extends void
  ? (config: { callback: (value: Update) => void }) => Promise<() => void>
  : (
      config: Args & { callback: (value: Update) => void }
    ) => Promise<() => void>;

// Usage:
// subscription({ arg1: "value", arg2?: 123, callback })
// subscription({ callback }) // for void args
```

#### Option 3: Separate Args and Callback Parameters

Keep current approach but enforce non-optional args only:

```typescript
// Force all subscription args to be required
export type Subscription<
  Args extends StructuredCloneable = void,
  Update extends StructuredCloneable = void,
> = {
  (
    ...args: [...RequiredArgsToParams<Args>, callback: (value: Update) => void]
  ): Promise<() => void>;
};
```

### Trade-offs

**Object-based (Option 1):**

- ✅ Simpler worker implementation
- ✅ Clear parameter structure
- ❌ Different API pattern from queries/mutations
- ❌ May require Comlink.proxy wrapping for callbacks in client

**Configuration Object (Option 2):**

- ✅ Unified object approach
- ✅ Very clear what's happening
- ❌ Verbose for simple cases
- ❌ Different from standard callback patterns

**Required Args Only (Option 3):**

- ✅ Maintains current API consistency
- ✅ No Comlink complications
- ❌ Limits flexibility for optional parameters
- ❌ Doesn't solve the core problem
