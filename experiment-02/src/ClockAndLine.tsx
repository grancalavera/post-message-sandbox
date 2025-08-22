import { useState } from "react";
import { clockAndLine } from "./shared-worker/clock";

const toTime = (value: number) => new Date(value).toLocaleTimeString();

export const ClockAndLine = () => {
  const [closeLine, setLine] = useState<() => void>();
  const [unsubscribe, setUnsubscribe] = useState<() => void>();

  return (
    <div>
      {unsubscribe ? (
        <button
          style={{ margin: 5 }}
          onClick={() => {
            unsubscribe();
            setUnsubscribe(undefined);
          }}
        >
          Subscribe from time
        </button>
      ) : (
        <button
          onClick={async () => {
            const unsubscribe = await clockAndLine.time((time) => {
              console.log("time from subs", toTime(time));
            });
            setUnsubscribe(() => unsubscribe);
          }}
          style={{ margin: 5 }}
        >
          Subscribe to time
        </button>
      )}
      {closeLine ? (
        <button
          style={{ margin: 5 }}
          onClick={() => {
            closeLine();
            setLine(undefined);
          }}
        >
          Close Line
        </button>
      ) : (
        <button
          style={{ margin: 5 }}
          onClick={async () => {
            const line = await clockAndLine.openLine((time) => {
              console.log("time from line", toTime(time));
            });
            setLine(() => line);
          }}
        >
          Open Line
        </button>
      )}
    </div>
  );
};
