import { Subject } from "rxjs";
import type { ProxyMarkedFunction, WorkerContract } from "../core/model";
import { BaseWorker } from "../core/worker";
import type { EchoContract } from "./contract";

export class EchoWorker
  extends BaseWorker
  implements WorkerContract<EchoContract>
{
  private echo$ = new Subject<string>();

  async echo(clientId: string, message: string): Promise<string> {
    const echoedMessage = `echo: ${message}`;
    console.log("echo", clientId, echoedMessage);

    if (this.echo$.observed) {
      this.echo$.next(echoedMessage);
    }

    return echoedMessage;
  }

  subscribeEcho(
    clientId: string,
    callback: ProxyMarkedFunction<(message: string) => void>
  ): Promise<ProxyMarkedFunction<() => void>> {
    console.log("subscribeEcho", clientId);
    return this.subscribe(clientId, callback, this.echo$);
  }
}
