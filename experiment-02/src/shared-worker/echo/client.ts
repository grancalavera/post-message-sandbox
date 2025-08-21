import { BaseClient } from "../core/client";
import type { Unsubscribe } from "../core/meta";
import type { EchoClientContract, EchoWorkerContract } from "./contract";
import * as Comlink from "comlink";

export class EchoClient
  extends BaseClient<EchoWorkerContract>
  implements EchoClientContract
{
  constructor(port: MessagePort, clientId: string) {
    super(port, clientId);
  }

  async echo(message: string): Promise<string> {
    return this.remote.echo(this.clientId, crypto.randomUUID(), message);
  }

  subscribeEcho(callback: (message: string) => void): Unsubscribe {
    const correlationId = crypto.randomUUID();
    this.remote.subscribeEcho_subscribe(
      this.clientId,
      correlationId,
      Comlink.proxy(callback),
    );
    return () => {
      this.remote.subscribeEcho_unsubscribe(this.clientId, correlationId);
    };
  }
}
