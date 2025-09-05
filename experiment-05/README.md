# experiment-05: JS Proxy: Pass additional arguments with Proxy traps

## Overview

Demonstrates how to use JavaScript Proxy to intercept function calls and add additional arguments before passing them to the target object.

## Implementation

This experiment shows how to:

- Create a target object with a `multiplyByTwo` function that takes a number and returns it multiplied by 2
- Use a Proxy with a `get` trap to intercept property access
- When the accessed property is a function, return a wrapper that accepts an additional string argument
- Log the string argument and then call the original function with the remaining arguments
- Return non-function properties unchanged

## Usage

1. Start the dev server: `npm run dev`
2. Navigate to: <http://localhost:5173/experiment-05/>
3. Click the buttons to see how the proxy intercepts function calls vs direct calls
4. Check the browser console to see the logged messages from the proxy
