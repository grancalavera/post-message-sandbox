import * as Comlink from "comlink";
import { Subject } from "rxjs";
import { BaseWorker } from "../core/worker";
import type { EchoWorkerContract } from "./contract";

class EchoWorker extends BaseWorker implements EchoWorkerContract {
  private echo$ = new Subject<string>();

  async echo(
    clientId: string,
    correlationId: string,
    message: string
  ): Promise<string> {
    const echoedMessage = `echo: ${message}`;
    console.log("echo", clientId, correlationId, echoedMessage);
    this.echo$.next(echoedMessage);
    return echoedMessage;
  }

  subscribeEcho_subscribe(
    clientId: string,
    correlationId: string,
    callback: (message: string) => void
  ): void {
    console.log("subscribeEcho_subscribe", clientId, correlationId);
    this.subscribe(clientId, correlationId, callback, this.echo$);
  }

  subscribeEcho_unsubscribe(clientId: string, correlationId: string): void {
    console.log("subscribeEcho_unsubscribe", clientId, correlationId);
    this.unsubscribe(clientId, correlationId);
  }
}

declare const self: SharedWorkerGlobalScope;

const worker = new EchoWorker();

self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  Comlink.expose(worker, port);
});
