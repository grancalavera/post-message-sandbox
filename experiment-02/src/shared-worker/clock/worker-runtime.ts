import { createSharedWorkerRuntime } from "../core/runtime";
import { ClockWorker } from "./worker";
createSharedWorkerRuntime(new ClockWorker());
