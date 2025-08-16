# Experiment 01: MessageChannel

This experiment demonstrates communication between windows using the MessageChannel API through Comlink. The main window can launch new browser windows and communicate with them bidirectionally.

## What it does

- Opens a child window from the main window
- Establishes a MessageChannel connection between parent and child
- Uses Comlink to abstract the postMessage API
- Allows sending messages from parent to child and receiving responses
- Displays message logs in both windows

## How to run

1. Start the dev server: `npm run dev`
2. Navigate to `/experiment-01/`
3. Click "Open Child Window" to launch the child window
4. Type messages and click "Send Message" to communicate with the child
5. Watch the message logs in both windows

## Files

- `index.html` - Main experiment page
- `src/main.tsx` - Main window React app entry point
- `src/App.tsx` - Main window component with MessageChannel logic
- `src/index.css` - Shared styles
- `child/index.html` - Child window page
- `child/src/main.tsx` - Child window React app with Comlink API