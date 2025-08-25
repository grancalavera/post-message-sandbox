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

Use the workbench CLI tool to create experiments:

```bash
npm run workbench create "Experiment Description"
```

This automatically:

- Creates `experiment-XX/` directory with auto-numbered naming
- Generates all required files from templates (index.html, src/main.tsx, src/App.tsx, src/index.css, README.md)
- Uses self-contained structure - all files are within the experiment directory
- Integrates with vite's auto-discovery system

For sub-pages within experiments:

- Create `experiment-XX/sub-page/index.html` with script reference: `<script type="module" src="./src/main.tsx"></script>`
- Create corresponding `experiment-XX/sub-page/src/main.tsx`

## Copying an Existing Experiment

Use the workbench CLI tool to copy experiments:

```bash
npm run workbench copy experiment-XX
```

This automatically:

- Copies the entire experiment directory to a new auto-numbered experiment
- Updates README.md references to use the new experiment name
- Preserves all functionality while creating an independent copy
- Useful for creating variations or building on existing experiments

## Implementing Experiments

1. Implement the experiment functionality according to the README.md specification
2. Ensure all code uses Comlink instead of direct postMessage APIs
3. Build the project to verify no TypeScript errors: `npm run build`
4. Smoke test the experiment manually using puppeteer:
   - Navigate to the experiment page
   - Test all interactive functionality (buttons, inputs, window opening)
   - Verify communication between windows/workers works as expected
   - Take screenshots to document the working state
   - Test error scenarios if applicable

## Deleting an Experiment

Use the workbench CLI tool to delete experiments:

```bash
npm run workbench delete experiment-XX
```

This automatically removes the entire experiment directory. No other cleanup needed - vite will auto-discover remaining experiments and the main App.tsx uses dynamic discovery.

## Stuff you MUST do

- Assume the vite dev server is running on port 5173, if is not running ask me to start it.
- If puppeteer fails to launch you may need to create a `./.puppeteer` directory in the root of the project.
- To create a new directory, use the write tool to create a file within the directory. The directory should be created automatically.
- Run `npm run check` after creating and modifying any files.
