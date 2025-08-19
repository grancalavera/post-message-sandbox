import { type EchoContract } from "./model";
import { BaseService, createSharedWorkerService } from "./service";

class EchoService extends BaseService<EchoContract> implements EchoContract {
  constructor(port: MessagePort, clientId: string) {
    super(port, clientId);
  }

  async echo(message: string): Promise<string> {
    return this.remote.echo(this.clientId, message);
  }
}

export const echoService = await createSharedWorkerService(
  new SharedWorker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  }),
  EchoService
);
