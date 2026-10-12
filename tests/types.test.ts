import { describe, expectTypeOf, it } from "vitest";
import type { LogLevelSnapshot, SetupStatus } from "../src/index.js";

describe("SetupStatus", () => {
  it("declares the mode an engine in setup mode reports", () => {
    expectTypeOf<SetupStatus["mode"]>().toEqualTypeOf<"setup" | undefined>();
  });
});

describe("LogLevelSnapshot", () => {
  it("carries level names, as the engine sends them", () => {
    expectTypeOf<LogLevelSnapshot["default_level"]>().toEqualTypeOf<string>();
    expectTypeOf<LogLevelSnapshot["tenants"]>().toEqualTypeOf<Record<string, string>>();
    expectTypeOf<LogLevelSnapshot["plugins"]>().toEqualTypeOf<Record<string, string>>();
  });
});
