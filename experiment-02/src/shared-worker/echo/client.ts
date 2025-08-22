import { WorkerProxy } from "../core/client";
import type { EchoClientContract, EchoWorkerContract } from "./contract";
import * as Comlink from "comlink";

export class EchoClient
  extends WorkerProxy<EchoWorkerContract>
  implements EchoClientContract
{
  constructor(
    port: MessagePort,
    clientId: string,
    getCorrelationId: () => string,
  ) {
    super(port, clientId, getCorrelationId);
  }

  echo(message: string): Promise<string> {
    return this.proxy.echo(this.clientId, this.getCorrelationId(), message);
  }

  async subscribeEcho(
    callback: (message: string) => void,
  ): Promise<() => void> {
    const correlationId = this.getCorrelationId();

    return this.proxy.subscribeEcho(
      this.clientId,
      correlationId,
      Comlink.proxy(callback),
    );
  }
}
