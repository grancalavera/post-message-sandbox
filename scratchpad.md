# Technical Design: Self-Contained Experiment Structure

## Current Structure Analysis

**Current dependencies across directories:**

- `experiment-01/index.html` → `/src/experiment-01/main.tsx`
- `experiment-01/child.html` → `/src/experiment-01/child.tsx`
- `vite.config.ts` has hardcoded entries for each experiment
- TypeScript source files are separated from HTML files

## Proposed Changes

**1. Self-contained experiment structure:**

```text
experiment-01/
├── index.html
├── child/
│   ├── index.html
│   └── src/
│       └── main.tsx
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   └── index.css
└── README.md
```

**2. Vite configuration changes:**

Create a dynamic entry discovery system in the root `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { glob } from "glob";

const experimentEntries = glob
  .sync("experiment-*/**/index.html")
  .reduce((entries, file) => {
    // Convert "experiment-01/child/index.html" to "experiment-01-child"
    const segments = file.split("/");
    const experimentName = segments[0]; // "experiment-01"
    const subPath = segments.slice(1, -1); // ["child"] or []

    const entryName =
      subPath.length > 0
        ? `${experimentName}-${subPath.join("-")}`
        : experimentName;

    entries[entryName] = file;
    return entries;
  }, {});

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        ...experimentEntries,
      },
    },
  },
});
```

**3. Entry Name Examples (JSON format):**

```json
{
  "main": "index.html",
  "experiment-01": "experiment-01/index.html",
  "experiment-01-child": "experiment-01/child/index.html",
  "experiment-01-popup": "experiment-01/popup/index.html",
  "experiment-02": "experiment-02/index.html",
  "experiment-02-worker": "experiment-02/worker/index.html",
  "experiment-03": "experiment-03/index.html",
  "experiment-03-iframe": "experiment-03/iframe/index.html",
  "experiment-03-service-worker": "experiment-03/service-worker/index.html"
}
```

**4. HTML file changes:**
Update experiment HTML files to reference local source files:

```html
<!-- experiment-01/index.html -->
<script type="module" src="./src/main.tsx"></script>

<!-- experiment-01/child/index.html -->
<script type="module" src="./src/main.tsx"></script>
```

**5. TypeScript configuration:**
Update `tsconfig.json` to include experiment directories:

```json
{
  "include": ["src", "experiment-*/src", "experiment-*/**/src"]
}
```

## Benefits

- Delete `experiment-01/` directory removes everything related to that experiment
- No manual vite.config.ts updates needed for new experiments
- Each experiment is completely self-contained
- Source files are co-located with their HTML entry points
- Glob pattern `experiment-*/**/index.html` auto-discovers all experiment entries
- Entry names follow predictable pattern: `experiment-01`, `experiment-01-child`, etc.
