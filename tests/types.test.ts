import { describe, expectTypeOf, it } from "vitest";
import type { SetupStatus } from "../src/index.js";

describe("SetupStatus", () => {
  it("declares the mode an engine in setup mode reports", () => {
    expectTypeOf<SetupStatus["mode"]>().toEqualTypeOf<"setup" | undefined>();
  });
});
