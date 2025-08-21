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
