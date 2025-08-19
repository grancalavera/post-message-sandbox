import * as Comlink from "comlink";
import {
  wrapRemote,
  type ClientRegistryContract,
  type EchoContract,
  type RemoteContract,
  type ServiceConstructor,
} from "./model";

class ClientRegistryService implements ClientRegistryContract {
  private remote: Comlink.Remote<RemoteContract<ClientRegistryContract>>;
  private clientId = crypto.randomUUID();

  constructor(remote: Comlink.Remote<RemoteContract<ClientRegistryContract>>) {
    this.remote = remote;
  }

  async registerClient(): Promise<void> {
    await this.remote.registerClient(this.clientId);
  }

  getClientId(): string {
    return this.clientId;
  }
}

class EchoService implements EchoContract {
  private remote: Comlink.Remote<RemoteContract<EchoContract>>;
  private clientId: string;

  constructor(
    remote: Comlink.Remote<RemoteContract<EchoContract>>,
    clientId: string
  ) {
    this.remote = remote;
    this.clientId = clientId;
  }

  async echo(message: string): Promise<string> {
    return this.remote.echo(this.clientId, message);
  }
}

const createSharedWorkerService = async <T>(
  Service: ServiceConstructor<T>
): Promise<T> => {
  const worker = new SharedWorker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });

  const registryService = new ClientRegistryService(
    wrapRemote<ClientRegistryContract>(worker.port)
  );

  await registryService.registerClient();

  return new Service(wrapRemote<T>(worker.port), registryService.getClientId());
};

export const echoService = await createSharedWorkerService(EchoService);
