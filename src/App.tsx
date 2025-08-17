import { useEffect, useState } from "react";
import "./App.css";

interface Experiment {
  name: string;
  path: string;
  title: string;
  description: string;
}

function App() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    // Auto-discover experiment README files
    // https://vite.dev/guide/features.html#glob-import
    const experimentReadmes = import.meta.glob("../experiment-*/README.md", {
      query: "?raw",
      import: "default",
      eager: true,
    });

    const discoveredExperiments = Object.entries(experimentReadmes).map(
      ([path, content]) => {
        const match = path.match(/experiment-([^/]+)/);
        const experimentName = match ? match[0] : "";

        // Parse title and description from README
        const lines = (content as string).split("\n");
        const title =
          lines
            .find((line: string) => line.startsWith("# "))
            ?.replace("# ", "") || experimentName;
        const description =
          lines.find((line: string) => line.trim() && !line.startsWith("#")) ||
          "";

        return {
          name: experimentName,
          path: `/${experimentName}/`,
          title,
          description,
        };
      },
    );

    setExperiments(discoveredExperiments);
  }, []);

  return (
    <div className="container">
      <h1>Post Message Sandbox</h1>
      <p>
        Experiments with browser APIs that use postMessage, integrated with
        Comlink.
      </p>

      <div className="experiments">
        <h2>Experiments</h2>
        <ul className="experiment-list">
          {experiments.map((exp) => (
            <li key={exp.name}>
              <a href={exp.path} className="experiment-link">
                <strong>{exp.title}</strong>
                <span>{exp.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
