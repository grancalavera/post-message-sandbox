import { BaseService } from "../core/client";
import type { EchoContract } from "./contract";
import * as Comlink from "comlink";

export class EchoService
  extends BaseService<EchoContract>
  implements EchoContract
{
  constructor(port: MessagePort, clientId: string) {
    super(port, clientId);
  }

  async echo(message: string): Promise<string> {
    return this.remote.echo(this.clientId, message);
  }

  subscribeEcho(callback: (message: string) => void): void {
    this.remote.subscribeEcho(this.clientId, Comlink.proxy(callback));
  }

  unsubscribeEcho(): void {
    this.remote.unsubscribeEcho(this.clientId);
  }
}
