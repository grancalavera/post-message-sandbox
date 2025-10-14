import { createSharedWorkerRuntime } from "@grancalavera/bridge";
import { vaultWorker } from "./worker";
createSharedWorkerRuntime(vaultWorker);
