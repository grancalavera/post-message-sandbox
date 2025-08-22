import { BaseClient } from "../core/client";
import type { Unsubscribe } from "../core/meta";
import type { EchoClientContract, EchoWorkerContract } from "./contract";
import * as Comlink from "comlink";

export class EchoClient
  extends BaseClient<EchoWorkerContract>
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
    return this.remote.echo(this.clientId, this.getCorrelationId(), message);
  }

  subscribeEcho(callback: (message: string) => void): Unsubscribe {
    const correlationId = this.getCorrelationId();
    this.remote.subscribeEcho_subscribe(
      this.clientId,
      correlationId,
      Comlink.proxy(callback)
    );
    return () => {
      this.remote.subscribeEcho_unsubscribe(this.clientId, correlationId);
    };
  }
}
