import { Subject } from "rxjs";
import { BaseWorker, subscribeMethod } from "../core/worker";
import type { EchoWorkerContract } from "./contract";

export class EchoWorker extends BaseWorker implements EchoWorkerContract {
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

  subscribeEcho(
    clientId: string,
    correlationId: string,
    callback: (message: string) => void
  ): Promise<() => void> {
    console.log("subscribeEcho", clientId, correlationId);
    return this[subscribeMethod](clientId, correlationId, callback, this.echo$);
  }
}
