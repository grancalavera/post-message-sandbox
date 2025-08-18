class Worker implements Registerable {
  private clientId: string;

  constructor() {
    this.clientId = this.generateClientId();
  }

  registerClient(): void {
    // Registration logic here
  }

  getClientId(): string {
    return this.clientId;
  }

  private generateClientId(): string {
    return "client-" + Math.random().toString(36).substr(2, 9);
  }
}
