import { useState } from "react";
import { clockAndLine } from "./shared-worker/clock";

export const ClockAndLine = () => {
  const [closeLine, setLine] = useState<() => void>();
  return (
    <div>
      {!closeLine && (
        <button
          onClick={async () => {
            const line = await clockAndLine.openLine((time) => {
              console.log("time", new Date(time).toLocaleTimeString());
            });
            setLine(() => line);
          }}
        >
          Open Line
        </button>
      )}
      {closeLine && (
        <button
          onClick={() => {
            closeLine();
            setLine(undefined);
          }}
        >
          Close Line
        </button>
      )}
    </div>
  );
};
