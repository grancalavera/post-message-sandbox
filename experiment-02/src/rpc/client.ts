import { type EchoContract } from "./model";
import {
  BaseService,
  createSharedWorkerService,
  type RemoteService,
} from "./service";

class EchoService extends BaseService<EchoContract> implements EchoContract {
  constructor(remote: RemoteService<EchoContract>, clientId: string) {
    super(remote, clientId);
  }

  async echo(message: string): Promise<string> {
    return this.remote.echo(this.clientId, message);
  }
}

export const echoService = await createSharedWorkerService(EchoService);
