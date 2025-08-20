import type { RemoteContract } from "./service";

export interface EchoContract {
  /**
   * Echoes the message back to the client.
   */
  echo(message: string): Promise<string>;

  /**
   * Gets all messages from shared message history.
   */
  getMessages(): Promise<string[]>;

  /**
   * Broadcasts a message to all connected clients.
   */
  broadcast(message: string): Promise<void>;
}

// this might not be necessary, maybe this can be written directly in the implementation
export type RemoteEchoContract = RemoteContract<EchoContract>;
