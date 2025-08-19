import type { RemoteContract } from "./service";

export interface EchoContract {
  /**
   * Echoes the message back to the client.
   */
  echo(message: string): Promise<string>;
}

// this might not be necessary, maybe this can be written directly in the implementation
export type RemoteEchoContract = RemoteContract<EchoContract>;
