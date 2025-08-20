import type { RemoteContract } from "./service";

export interface EchoContract {
  /**
   * Echoes the message back to the client.
   */
  echo(message: string): Promise<string>;

  /**
   * Subscribes to all echo messages.
   * @param callback
   */
  subscribeEcho(callback: (message: string) => void): void;

  /**
   * Unsubscribes from all echo messages.
   */
  unsubscribeEcho(): void;
}

// this might not be necessary, maybe this can be written directly in the implementation
export type RemoteEchoContract = RemoteContract<EchoContract>;
