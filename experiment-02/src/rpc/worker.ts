import * as Comlink from "comlink";
import type { EchoContract } from "./model";
import type { ClientRegistryContract, RemoteContract } from "./service";

interface ClientRep {
  clientId: string;
}

const clientRep = (clientId: string): ClientRep => ({ clientId });

class Worker implements RemoteContract<EchoContract & ClientRegistryContract> {
  private clients: Map<string, ClientRep> = new Map();
  private messageHistory: string[] = [];

  async registerClient(clientId: string): Promise<void> {
    if (this.clients.has(clientId)) return;

    console.log("registerClient", clientId);
    this.clients.set(clientId, clientRep(clientId));

    navigator.locks.request(clientId, async () => {
      this.unregisterClient(clientId);
    });
  }

  private async unregisterClient(clientId: string): Promise<void> {
    console.log("unregisterClient", clientId);
    this.clients.delete(clientId);
  }

  async echo(clientId: string, message: string): Promise<string> {
    if (!this.clients.has(clientId)) {
      throw new Error(`Unknown client ${clientId}`);
    }
    console.log(`${clientId} echo "${message}"`);

    // Add message to shared history
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${clientId.slice(0, 8)}: ${message} → echo: ${message}`;
    this.messageHistory.push(logMessage);

    // Keep only last 50 messages
    if (this.messageHistory.length > 50) {
      this.messageHistory = this.messageHistory.slice(-50);
    }

    return `echo: ${message}`;
  }

  async getMessages(clientId: string): Promise<string[]> {
    if (!this.clients.has(clientId)) {
      throw new Error(`Unknown client ${clientId}`);
    }
    return [...this.messageHistory];
  }

  async broadcast(clientId: string, message: string): Promise<void> {
    if (!this.clients.has(clientId)) {
      throw new Error(`Unknown client ${clientId}`);
    }

    console.log(`${clientId} broadcast "${message}"`);

    // Add broadcast message to shared history
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${clientId.slice(0, 8)} (broadcast): ${message}`;
    this.messageHistory.push(logMessage);

    // Keep only last 50 messages
    if (this.messageHistory.length > 50) {
      this.messageHistory = this.messageHistory.slice(-50);
    }
  }
}

declare const self: SharedWorkerGlobalScope;

const worker = new Worker();

self.addEventListener("connect", (event) => {
  const port = event.ports[0];
  Comlink.expose(worker, port);
});
