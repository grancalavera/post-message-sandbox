# experiment-05: JS Proxy: Pass additional arguments with Proxy traps

## Overview

Demonstrates how to use JavaScript Proxy to automatically inject additional arguments when calling internal API methods, creating a clean public interface that hides implementation details.

## Implementation

This experiment shows how to:

- Create an **Internal API** (`InternalApi`) that requires a `proxyId` parameter for tracking/logging
- Create a **Public API** (`PublicApi`) that provides a clean interface without the tracking parameter
- Use a Proxy with a `get` trap to automatically inject the `proxyId` when functions are called
- Generate unique proxy IDs for each proxy instance to enable tracking and debugging

The flow works like this:

```
Public API: proxy.multiplyByTwo(5)
    ↓ (proxy automatically injects proxyId)
Internal API: target.multiplyByTwo("proxy-abc123", 5)
```

## Key Features

- **Automatic ID injection**: The proxy transparently adds a unique identifier to all function calls
- **Clean public interface**: Users of the public API don't need to know about internal tracking requirements
- **Type safety**: Full TypeScript support with proper interface definitions
- **Non-function properties**: Properties are passed through unchanged

## Usage

1. Start the dev server: `npm run dev`
2. Navigate to: <http://localhost:5173/experiment-05/>
3. Click the buttons to see how the proxy automatically injects proxy IDs
4. Check the browser console to see the internal API receiving the injected proxy IDs
