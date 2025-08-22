import * as Comlink from "comlink";
import { WorkerProxy } from "../core/client";
import type { Unsubscribe } from "../core/meta";
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

  async openLine(callback: (time: number) => void): Promise<() => void> {
    return this.proxy.openLine(
      this.clientId,
      this.getCorrelationId(),
      Comlink.proxy(callback)
    );
  }

  time(callback: (time: number) => void): Unsubscribe {
    const correlationId = this.getCorrelationId();

    this.proxy.time_subscribe(
      this.clientId,
      correlationId,
      Comlink.proxy(callback)
    );

    return () => {
      this.proxy.time_unsubscribe(this.clientId, correlationId);
    };
  }
}
