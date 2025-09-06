import * as Comlink from "comlink";

interface WorkerApi {
  multiplyByTwo: (clientId: string, num: number) => number;
  someProperty: string;
}

interface ClientApi {
  multiplyByTwo: (num: number) => number;
  someProperty: string;
}

const target: WorkerApi = {
  multiplyByTwo: (clientId: string, num: number) => {
    console.log(`Internal API called with proxyId: ${clientId}`);
    return num * 2;
  },
  someProperty: "hello world",
};

function createClient(target: WorkerApi): ClientApi {
  const clientId = crypto.randomUUID();
  console.log(`Created client with ID: ${clientId}`);

  return new Proxy(target, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (typeof value === "function") {
        return function (...args: unknown[]) {
          // Process args to wrap functions in Comlink proxies
          const processedArgs = args.map((arg) =>
            typeof arg === "function" ? Comlink.proxy(arg) : arg
          );

          // Inject proxyId as first argument
          return value.apply(target, [clientId, ...processedArgs]);
        };
      }

      return value;
    },
  }) as unknown as ClientApi;
}

const f = Comlink.proxy(() => {});

const proxy = createClient(target);

// Demo usage
console.log("=== Direct internal API calls ===");
console.log(
  "target.multiplyByTwo('manual-id', 5):",
  target.multiplyByTwo("manual-id", 5)
);
console.log("target.someProperty:", target.someProperty);

console.log("\n=== Public API calls (via proxy) ===");
console.log("proxy.multiplyByTwo(5):", proxy.multiplyByTwo(5));
console.log("proxy.multiplyByTwo(10):", proxy.multiplyByTwo(10));
console.log("proxy.someProperty:", proxy.someProperty);
