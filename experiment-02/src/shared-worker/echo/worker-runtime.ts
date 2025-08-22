import * as Comlink from "comlink";
import { EchoWorker } from "./worker";

declare const self: SharedWorkerGlobalScope;

const worker = new EchoWorker();

self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  Comlink.expose(worker, port);
});
