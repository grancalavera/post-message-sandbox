import { WorkerProxy } from "../core/client";
import type { Unsubscribe } from "../core/meta";
import type { EchoClientContract, EchoWorkerContract } from "./contract";

export class EchoClient
  extends WorkerProxy<EchoWorkerContract>
  implements EchoClientContract
{
  constructor(
    port: MessagePort,
    clientId: string,
    getCorrelationId: () => string
  ) {
    super(port, clientId, getCorrelationId);
  }

  async echo(message: string): Promise<string> {
    return this.proxy.echo(this.clientId, this.getCorrelationId(), message);
  }

  subscribeEcho(callback: (message: string) => void): Unsubscribe {
    return this.subscribe(
      this.proxy.subscribeEcho_subscribe,
      this.proxy.subscribeEcho_unsubscribe,
      callback
    );
  }
}
