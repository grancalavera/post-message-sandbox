import { type EchoContract } from "./model";
import { BaseService, createSharedWorkerService } from "./service";
import * as Comlink from "comlink";

class EchoService extends BaseService<EchoContract> implements EchoContract {
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

export const echoService = await createSharedWorkerService(
  new SharedWorker(new URL("./worker.ts", import.meta.url), {
    type: "module",
    name: "Echo Service",
  }),
  EchoService,
);
