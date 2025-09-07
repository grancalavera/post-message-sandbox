import { Subject } from "rxjs";
import type { ProxyMarkedFunction, WorkerContract } from "../core/model";
import { BaseWorker } from "../core/worker";
import type { EchoContract } from "./contract";

export class EchoWorker
  extends BaseWorker
  implements WorkerContract<EchoContract>
{
  private echo$ = Promise.resolve(new Subject<string>());

  async echo(clientId: string, message: string): Promise<string> {
    const echo$ = await this.echo$;
    const echoedMessage = `echo: ${message} ${clientId}`;
    console.log(echoedMessage);

    console.log("echo$", echo$);
    console.log("echo$.observed", echo$.observed);

    if (echo$.observed) {
      echo$.next(echoedMessage);
    }

    return echoedMessage;
  }

  async subscribeEcho(
    clientId: string,
    callback: ProxyMarkedFunction<(message: string) => void>
  ): Promise<ProxyMarkedFunction<() => void>> {
    const echo$ = await this.echo$;
    console.log("subscribeEcho", clientId);
    return this.subscribe(clientId, callback, echo$);
  }
}
