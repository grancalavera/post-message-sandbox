import * as Comlink from "comlink";
import { WorkerProxy } from "../core/client";
import type { EchoContract } from "./contract";

export class EchoClient
  extends WorkerProxy<EchoContract>
  implements EchoContract
{
  constructor(port: MessagePort, clientId: string) {
    super(port, clientId);
  }

  echo(message: string): Promise<string> {
    return this.proxy.echo(this.clientId, message);
  }

  async subscribeEcho(
    callback: (message: string) => void
  ): Promise<() => void> {
    return this.proxy.subscribeEcho(this.clientId, Comlink.proxy(callback));
  }
}
