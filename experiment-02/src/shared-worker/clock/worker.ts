import * as Comlink from "comlink";
import { interval, map, shareReplay } from "rxjs";
import { BaseWorker } from "../core/worker";
import type { ClockWorkerContract } from "./contract";

export class ClockWorker extends BaseWorker implements ClockWorkerContract {
  private time$ = interval(1000).pipe(
    map(() => Date.now()),
    shareReplay({ bufferSize: 0, refCount: true })
  );

  async openLine(
    clientId: string,
    correlationId: string,
    callback: (time: number) => void
  ): Promise<() => void> {
    console.log("openLine", clientId, correlationId);
    const subscription = this.time$.subscribe(callback);
    return Comlink.proxy(() => {
      console.log("closeLine", clientId, correlationId);
      subscription.unsubscribe();
    });
  }

  time_subscribe(
    clientId: string,
    correlationId: string,
    callback: (value: number) => void
  ): void {
    console.log("time_subscribe", clientId, correlationId);
    this.subscribe(clientId, correlationId, callback, this.time$);
  }

  time_unsubscribe(clientId: string, correlationId: string): void {
    console.log("time_unsubscribe", clientId, correlationId);
    this.unsubscribe(clientId, correlationId);
  }
}
