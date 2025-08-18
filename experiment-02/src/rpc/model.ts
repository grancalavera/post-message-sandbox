export interface Registerable {
  /**
   * Registers the client. Assumes internally an unique client ID is generated.
   */
  registerClient(): void;

  /**
   * Returns the unique client ID.
   */
  getClientId(): string;
}
