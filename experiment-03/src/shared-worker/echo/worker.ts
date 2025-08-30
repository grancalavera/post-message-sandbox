import { Subject } from "rxjs";
import { BaseWorker } from "../core/worker";
import type { EchoWorkerContract } from "./contract";

export class EchoWorker extends BaseWorker implements EchoWorkerContract {
  private echo$ = new Subject<string>();

  async echo(clientId: string, message: string): Promise<string> {
    const echoedMessage = `echo: ${message}`;
    console.log("echo", clientId, echoedMessage);
    this.echo$.next(echoedMessage);
    return echoedMessage;
  }

  subscribeEcho(
    clientId: string,
    callback: (message: string) => void,
  ): Promise<() => void> {
    console.log("subscribeEcho", clientId);
    return this.subscribe(clientId, callback, this.echo$);
  }
}
