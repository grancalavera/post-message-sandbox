# Recursive Comlink Proxy Processing

This document outlines the approach for recursively processing arguments to wrap functions in Comlink proxies, handling nested structures as defined by the `ComlinkCompatible` type.

## Problem

The `ComlinkCompatible` type allows functions to be nested within:

- Arrays: `Array<ComlinkCompatible>`
- Plain objects: `{ [key: string]: ComlinkCompatible }`
- Maps: `Map<ComlinkCompatible, ComlinkCompatible>`
- Sets: `Set<ComlinkCompatible>`

When passing arguments across worker boundaries, all functions need to be wrapped with `Comlink.proxy()`, including those nested within these structures.

## Solution

Use a recursive function to traverse and process all argument values:

```typescript
import * as Comlink from "comlink";

function processArgsForComlink(value: unknown): unknown {
  // Handle functions - wrap in Comlink proxy
  if (typeof value === "function") {
    return Comlink.proxy(value);
  }

  // Handle Arrays - recursively process elements
  if (Array.isArray(value)) {
    return value.map(processArgsForComlink);
  }

  // Handle Sets - recursively process values
  if (value instanceof Set) {
    return new Set([...value].map(processArgsForComlink));
  }

  // Handle Maps - recursively process keys and values
  if (value instanceof Map) {
    return new Map(
      [...value.entries()].map(([k, v]) => [
        processArgsForComlink(k),
        processArgsForComlink(v),
      ])
    );
  }

  // Handle plain objects - recursively process properties
  if (value && typeof value === "object" && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, processArgsForComlink(v)])
    );
  }

  // All other types must be ComlinkCompatible - throw error if not
  if (value !== null && value !== undefined && typeof value === "object") {
    throw new Error(
      `Invalid type for Comlink processing: ${value.constructor.name}`
    );
  }

  // Primitives (string, number, boolean), null, undefined pass through unchanged
  return value;
}
```

## Usage

Replace simple function checking with recursive processing:

```typescript
// Before (shallow checking)
const processedArgs = args.map((arg) =>
  typeof arg === "function" ? Comlink.proxy(arg) : arg
);

// After (recursive checking)
const processedArgs = args.map(processArgsForComlink);
```

## Examples

```typescript
// Simple function
processArgsForComlink(myCallback); // → Comlink.proxy(myCallback)

// Array with functions
processArgsForComlink([1, myCallback, "text"]); // → [1, Comlink.proxy(myCallback), "text"]

// Object with nested functions
processArgsForComlink({
  data: "value",
  handlers: {
    onClick: myCallback,
    onError: anotherCallback,
  },
}); // → { data: "value", handlers: { onClick: Comlink.proxy(myCallback), onError: Comlink.proxy(anotherCallback) } }

// Set with functions
processArgsForComlink(new Set([myCallback, "value"])); // → new Set([Comlink.proxy(myCallback), "value"])

// Map with function keys/values
processArgsForComlink(
  new Map([
    ["key", myCallback],
    [anotherCallback, "value"],
  ])
); // → new Map([["key", Comlink.proxy(myCallback)], [Comlink.proxy(anotherCallback), "value"]])
```

## Error Handling

The function throws a runtime error for any value that cannot be processed as `ComlinkCompatible`:

```typescript
// This will throw an error
processArgsForComlink(new Date()); // Error: Invalid type for Comlink processing: Date
processArgsForComlink(document.createElement("div")); // Error: Invalid type for Comlink processing: HTMLDivElement
```

## Notes

- Only processes plain objects (created with `{}` or `new Object()`)
- Throws runtime errors for non-ComlinkCompatible object types
- Handles circular references by nature of the structured clone algorithm
- All structured cloneable types pass through unchanged
