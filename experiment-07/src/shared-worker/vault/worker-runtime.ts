import { createSharedWorkerRuntime } from "../core/runtime";
import { VaultWorker } from "./worker";
createSharedWorkerRuntime(new VaultWorker());
