import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatNumber,
  titleCase,
} from "@/lib/format";

describe("formatDate", () => {
  it("formats a date in en-GB style", () => {
    expect(formatDate(new Date(Date.UTC(2026, 8, 23)))).toBe("23 Sept 2026");
  });

  it("returns em dash for null/undefined", () => {
    expect(formatDate(null)).toBe("—");

    expect(formatDate(undefined)).toBe("—");
  });
});

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(38412)).toBe("38,412");
  });
});

describe("titleCase", () => {
  it("converts SCREAMING_SNAKE_CASE to Title Case", () => {
    expect(titleCase("UNDER_REVIEW")).toBe("Under Review");

    expect(titleCase("SUCCESS")).toBe("Success");
  });
});
