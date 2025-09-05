interface Target {
  multiplyByTwo: (num: number) => number;
  someProperty: string;
}

interface ProxiedTarget {
  multiplyByTwo: (message: string, num: number) => number;
  someProperty: string;
}

const target: Target = {
  multiplyByTwo: (num: number) => num * 2,
  someProperty: "hello world",
};

const proxy = new Proxy(target, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);

    if (typeof value === "function") {
      return function (message: string, ...args: unknown[]) {
        console.log(message);
        return value.apply(target, args);
      };
    }

    return value;
  },
}) as unknown as ProxiedTarget;

// Demo usage
console.log("=== Direct target calls ===");
console.log("target.multiplyByTwo(5):", target.multiplyByTwo(5));
console.log("target.someProperty:", target.someProperty);

console.log("\n=== Proxy calls ===");
console.log(
  "proxy.multiplyByTwo('Hello from proxy!', 5):",
  proxy.multiplyByTwo("Hello from proxy!", 5)
);
console.log(
  "proxy.multiplyByTwo('Another message', 10):",
  proxy.multiplyByTwo("Another message", 10)
);
console.log("proxy.someProperty:", proxy.someProperty);
