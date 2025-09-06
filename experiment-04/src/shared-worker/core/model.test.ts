import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Comlink from "comlink";

// Mock Comlink.proxy to avoid actual worker setup in tests
vi.mock("comlink", () => ({
  proxy: vi.fn((fn) => {
    const proxiedFn = fn;
    proxiedFn[Symbol.for("Comlink.proxy")] = true;
    return proxiedFn;
  }),
}));

// Import the function to test (will be implemented later)
import { processArgsForComlink } from "./model";

describe("processArgsForComlink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("primitives", () => {
    it("should pass through string values unchanged", () => {
      const result = processArgsForComlink("hello");
      expect(result).toBe("hello");
    });

    it("should pass through number values unchanged", () => {
      const result = processArgsForComlink(42);
      expect(result).toBe(42);
    });

    it("should pass through boolean values unchanged", () => {
      const result = processArgsForComlink(true);
      expect(result).toBe(true);
      const result2 = processArgsForComlink(false);
      expect(result2).toBe(false);
    });

    it("should pass through null unchanged", () => {
      const result = processArgsForComlink(null);
      expect(result).toBe(null);
    });

    it("should pass through undefined unchanged", () => {
      const result = processArgsForComlink(undefined);
      expect(result).toBe(undefined);
    });
  });

  describe("functions", () => {
    it("should wrap functions in Comlink.proxy", () => {
      const testFn = () => {};
      const result = processArgsForComlink(testFn);
      expect(Comlink.proxy).toHaveBeenCalledWith(testFn);
      expect(result).toBe(testFn);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any)[Symbol.for("Comlink.proxy")]).toBe(true);
    });

    it("should wrap named functions in Comlink.proxy", () => {
      function namedFunction() {}
      const result = processArgsForComlink(namedFunction);
      expect(Comlink.proxy).toHaveBeenCalledWith(namedFunction);
      expect(result).toBe(namedFunction);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any)[Symbol.for("Comlink.proxy")]).toBe(true);
    });

    it("should wrap arrow functions in Comlink.proxy", () => {
      const arrowFn = () => {};
      const result = processArgsForComlink(arrowFn);
      expect(Comlink.proxy).toHaveBeenCalledWith(arrowFn);
      expect(result).toBe(arrowFn);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any)[Symbol.for("Comlink.proxy")]).toBe(true);
    });
  });

  describe("arrays", () => {
    it("should recursively process array elements", () => {
      const testFn = () => {};
      const array = [1, testFn, "text"];
      const result = processArgsForComlink(array);
      expect(result).toEqual([1, testFn, "text"]);
      expect(Comlink.proxy).toHaveBeenCalledWith(testFn);
    });

    it("should handle empty arrays", () => {
      const result = processArgsForComlink([]);
      expect(result).toEqual([]);
    });

    it("should handle nested arrays", () => {
      const testFn = () => {};
      const nested = [1, [testFn, "nested"], 3];
      const result = processArgsForComlink(nested);
      expect(result).toEqual([1, [testFn, "nested"], 3]);
    });
  });

  describe("sets", () => {
    it("should recursively process Set values", () => {
      const testFn = () => {};
      const set = new Set([testFn, "value"]);
      const result = processArgsForComlink(set);
      expect(result).toBeInstanceOf(Set);
      expect([...(result as Set<unknown>)]).toEqual(
        expect.arrayContaining(["proxy(anonymous)", "value"])
      );
    });

    it("should handle empty sets", () => {
      const set = new Set();
      const result = processArgsForComlink(set);
      expect(result).toBeInstanceOf(Set);
      expect((result as Set<unknown>).size).toBe(0);
    });

    it("should preserve Set ordering", () => {
      const testFn1 = () => {};
      const testFn2 = () => {};
      const set = new Set([testFn1, "middle", testFn2]);
      const result = processArgsForComlink(set);
      expect([...(result as Set<unknown>)]).toEqual([
        "proxy(anonymous)",
        "middle",
        "proxy(anonymous)",
      ]);
    });
  });

  describe("maps", () => {
    it("should recursively process Map keys and values", () => {
      const keyFn = () => {};
      const valueFn = () => {};
      const map = new Map([
        ["key", valueFn] as [unknown, unknown],
        [keyFn, "value"] as [unknown, unknown],
      ]);
      const result = processArgsForComlink(map);
      expect(result).toBeInstanceOf(Map);
      expect([...(result as Map<unknown, unknown>).entries()]).toEqual([
        ["key", "proxy(anonymous)"],
        ["proxy(anonymous)", "value"],
      ]);
    });

    it("should handle empty maps", () => {
      const map = new Map();
      const result = processArgsForComlink(map);
      expect(result).toBeInstanceOf(Map);
      expect((result as Map<unknown, unknown>).size).toBe(0);
    });

    it("should preserve Map ordering", () => {
      const testFn = () => {};
      const map = new Map([
        ["first", testFn] as [unknown, unknown],
        ["second", "value"] as [unknown, unknown],
        ["third", testFn] as [unknown, unknown],
      ]);
      const result = processArgsForComlink(map);
      expect([...(result as Map<unknown, unknown>).entries()]).toEqual([
        ["first", "proxy(anonymous)"],
        ["second", "value"],
        ["third", "proxy(anonymous)"],
      ]);
    });
  });

  describe("plain objects", () => {
    it("should recursively process plain object properties", () => {
      const testFn = () => {};
      const obj = {
        data: "value",
        callback: testFn,
        nested: {
          handler: testFn,
        },
      };
      const result = processArgsForComlink(obj);
      expect(result).toEqual({
        data: "value",
        callback: "proxy(anonymous)",
        nested: {
          handler: "proxy(anonymous)",
        },
      });
    });

    it("should handle empty objects", () => {
      const result = processArgsForComlink({});
      expect(result).toEqual({});
    });

    it("should only process plain objects (Object constructor)", () => {
      const plainObj = { key: "value" };
      const result = processArgsForComlink(plainObj);
      expect(result).toEqual({ key: "value" });
    });
  });

  describe("complex nested structures", () => {
    it("should handle deeply nested structures", () => {
      const testFn = () => {};
      const complex = {
        array: [testFn, { nested: testFn }],
        set: new Set([testFn]),
        map: new Map([["key", testFn] as [unknown, unknown]]),
        object: {
          deep: {
            callback: testFn,
          },
        },
      };
      const result = processArgsForComlink(complex);
      expect(result).toEqual({
        array: ["proxy(anonymous)", { nested: "proxy(anonymous)" }],
        set: new Set(["proxy(anonymous)"]),
        map: new Map([["key", "proxy(anonymous)"]]),
        object: {
          deep: {
            callback: "proxy(anonymous)",
          },
        },
      });
    });

    it("should handle mixed array with different types", () => {
      const testFn = () => {};
      const mixed = [
        1,
        "string",
        testFn,
        { prop: testFn },
        new Set([testFn]),
        new Map([["key", testFn] as [unknown, unknown]]),
        null,
        undefined,
      ];
      const result = processArgsForComlink(mixed);
      expect(result).toEqual([
        1,
        "string",
        "proxy(anonymous)",
        { prop: "proxy(anonymous)" },
        new Set(["proxy(anonymous)"]),
        new Map([["key", "proxy(anonymous)"]]),
        null,
        undefined,
      ]);
    });
  });

  describe("error cases", () => {
    it("should throw error for Date objects", () => {
      const date = new Date();
      expect(() => processArgsForComlink(date)).toThrow(
        "Invalid type for Comlink processing: Date"
      );
    });

    it("should throw error for RegExp objects", () => {
      const regex = /test/;
      expect(() => processArgsForComlink(regex)).toThrow(
        "Invalid type for Comlink processing: RegExp"
      );
    });

    it("should throw error for custom class instances", () => {
      class CustomClass {}
      const instance = new CustomClass();
      expect(() => processArgsForComlink(instance)).toThrow(
        "Invalid type for Comlink processing: CustomClass"
      );
    });

    it("should throw error for DOM elements", () => {
      const element = { constructor: { name: "HTMLDivElement" } };
      expect(() => processArgsForComlink(element)).toThrow(
        "Invalid type for Comlink processing: HTMLDivElement"
      );
    });

    it("should throw error for Error objects", () => {
      const error = new Error("test");
      expect(() => processArgsForComlink(error)).toThrow(
        "Invalid type for Comlink processing: Error"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle objects created with Object.create(null)", () => {
      const nullProtoObj = Object.create(null);
      nullProtoObj.key = "value";
      expect(() => processArgsForComlink(nullProtoObj)).toThrow();
    });

    it("should handle objects created with new Object()", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const objInstance = new Object() as any;
      objInstance.key = "value";
      const result = processArgsForComlink(objInstance);
      expect(result).toEqual({ key: "value" });
    });

    it("should differentiate between plain objects and class instances", () => {
      class MyClass {
        prop: string;
        constructor() {
          this.prop = "value";
        }
      }
      const instance = new MyClass();
      expect(() => processArgsForComlink(instance)).toThrow(
        "Invalid type for Comlink processing: MyClass"
      );
    });
  });
});
