# AGENTS

This is a sandbox to play around with the browser apis that use post message and find ways to integrate them with Comlink.

Always use neutral language and just leave instructions, we don't care if an experiment is a better approach than another one, we just want to do it and we just need to know what to do.

## Constraints

- Do not use the postMessage API directly, instead use Comlink as an abstraction layer <https://github.com/GoogleChromeLabs/comlink/tree/main>
- Do not use these browser APIs directly - use Comlink instead:
  - `postMessage` (WebWorkers, Windows, MessagePorts)
  - `MessageChannel` API
  - `SharedWorker` communication
  - `BroadcastChannel` API
  - Window-to-window communication via `postMessage`
  - ServiceWorker messaging

## Experiment Structure

- for each experiment create a new vite entry point
- experiments should be self-contained - deleting an experiment directory should remove everything related to that experiment
- for vite entry points, use the structure: `experiment-name/index.html` with `experiment-name/src/main.tsx`
- for sub-pages within experiments, use: `experiment-name/sub-page/index.html` with `experiment-name/sub-page/src/main.tsx`
- vite config uses `glob.sync("experiment-*/**/index.html")` to auto-discover entries
- entry names follow pattern: `experiment-01`, `experiment-01-child`, `experiment-01-popup`

## Creating a New Experiment

1. Create experiment directory: `experiment-XX/`
2. Add `experiment-XX/README.md` explaining what the experiment does
3. Add `experiment-XX/index.html` with script reference: `<script type="module" src="./src/main.tsx"></script>`
4. Create `experiment-XX/src/main.tsx` with React app
5. For sub-pages, create `experiment-XX/sub-page/index.html` with script reference: `<script type="module" src="./src/main.tsx"></script>`
6. Create corresponding `experiment-XX/sub-page/src/main.tsx`
7. Vite will auto-discover entries via glob pattern

## Deleting an Experiment

1. Delete the entire experiment directory: `rm -rf experiment-XX/`
2. No other cleanup needed - vite will auto-discover remaining experiments

## Stuff you may need to know

- Assume the vite dev server is running on port 5173, if is not running ask me to start it.
- If puppeteer fails to launch you may need to create a `./.puppeteer` directory in the root of the project.
