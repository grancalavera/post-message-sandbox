import * as Comlink from "comlink";
import { WorkerProxy } from "../core/client";
import type { ClockClientContract, ClockWorkerContract } from "./contract";

export class ClockClient
  extends WorkerProxy<ClockWorkerContract>
  implements ClockClientContract
{
  constructor(
    port: MessagePort,
    clientId: string,
    getCorrelationId: () => string
  ) {
    super(port, clientId, getCorrelationId);
  }

  openLine(callback: (time: number) => void): Promise<() => void> {
    return this.proxy.openLine(
      this.clientId,
      this.getCorrelationId(),
      Comlink.proxy(callback)
    );
  }

  time(callback: (time: number) => void): Promise<() => void> {
    const correlationId = this.getCorrelationId();

    return this.proxy.time(
      this.clientId,
      correlationId,
      Comlink.proxy(callback)
    );
  }
}
