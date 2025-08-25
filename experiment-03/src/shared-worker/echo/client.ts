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
    const unsubscribe = await this.proxy.subscribeEcho(
      this.clientId,
      this.getCorrelationId(),
      Comlink.proxy(callback),
    );

    // Track the subscription for cleanup on dispose
    this.addSubscription(unsubscribe);

    // Return a wrapped unsubscribe function that also removes from tracking
    return () => {
      this.removeSubscription(unsubscribe);
      unsubscribe();
    };
  }
}
