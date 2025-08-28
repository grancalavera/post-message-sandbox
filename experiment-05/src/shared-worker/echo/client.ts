import { WorkerProxy } from "../core/client";
import type { EchoClientContract, EchoWorkerContract } from "./contract";
import * as Comlink from "comlink";

export class EchoClient
  extends WorkerProxy<EchoWorkerContract>
  implements EchoClientContract
{
  constructor(port: MessagePort, clientId: string) {
    super(port, clientId);
  }

  echo(message: string): Promise<string> {
    return this.proxy.echo(this.clientId, message);
  }

  subscribeEcho(callback: (message: string) => void): Promise<() => void> {
    return this.proxy.subscribeEcho(this.clientId, Comlink.proxy(callback));
  }
}
