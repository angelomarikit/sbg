import { describe, expect, it } from "vitest";
import { formatPHP, parseMoney } from "@/lib/formatting/currency";

describe("currency", () => {
  it("formats PHP", () => {
    expect(formatPHP(3880)).toContain("3,880");
  });

  it("parses money safely", () => {
    expect(parseMoney("7998.5")).toBe(7998.5);
    expect(parseMoney(null)).toBe(0);
  });
});
