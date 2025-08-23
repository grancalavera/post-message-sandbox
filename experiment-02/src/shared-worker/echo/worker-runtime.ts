import { createSharedWorkerRuntime } from "../core/runtime";
import { EchoWorker } from "./worker";
createSharedWorkerRuntime(new EchoWorker());
