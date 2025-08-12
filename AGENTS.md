# AGENTS

This is a sandbox to play around with the browser apis that use post message.

## Constraints

- do not use the postMessage api directly, instead use Comlink as an abstraction layer https://github.com/GoogleChromeLabs/comlink/tree/main
- for each experiment create a new vite entry point
- for vite entry points, use a directory for the entry point name, with an `index.html`, with a corresponding `main.tsx` file in `src`.
- assume the vite dev server is running on port 5173, if is not running ask me to start it.
- Use neutral language and just leave instructions, we don't care if an experiment is a better approach than another one, we just want to do it and we just need to know what to do.

## Stuff you may need to know

- If puppeteer fails to launch you may need to create a `./.puppeteer` directory in the root of the project.
