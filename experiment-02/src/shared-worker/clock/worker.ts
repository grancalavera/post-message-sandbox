import * as Comlink from "comlink";
import { interval, map, shareReplay } from "rxjs";
import { BaseWorker } from "../core/worker";
import type { ClockWorkerContract } from "./contract";

export class ClockWorker extends BaseWorker implements ClockWorkerContract {
  private time$ = interval(1000).pipe(
    map(() => Date.now()),
    shareReplay({ bufferSize: 0, refCount: true }),
  );

  async openLine(
    clientId: string,
    correlationId: string,
    callback: (time: number) => void,
  ): Promise<() => void> {
    console.log("openLine", clientId, correlationId);
    const subscription = this.time$.subscribe(callback);
    return Comlink.proxy(() => {
      console.log("closeLine", clientId, correlationId);
      subscription.unsubscribe();
    });
  }

  async time(
    clientId: string,
    correlationId: string,
    callback: (value: number) => void,
  ): Promise<() => void> {
    console.log("time", clientId, correlationId);
    return this.subscribe(clientId, correlationId, callback, this.time$);
  }
}
