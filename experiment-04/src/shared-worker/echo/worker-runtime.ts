import { createSharedWorkerRuntime } from "../core/runtime";
import { echoWorker, registryWorker } from "./worker";

createSharedWorkerRuntime({
  ...echoWorker,
  ...registryWorker,
});
