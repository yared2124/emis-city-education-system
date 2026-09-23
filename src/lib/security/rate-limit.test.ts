import { afterEach, describe, expect, it } from "vitest";

import { rateLimit } from "@/lib/security/rate-limit";

afterEach(() => {
  // Distinct keys per test keep buckets isolated.
});

describe("rate limiter", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test-${Math.random()}`;

    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    }

    const blocked = rateLimit(key, 3, 60_000);

    expect(blocked.allowed).toBe(false);

    expect(blocked.remaining).toBe(0);

    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks remaining attempts", () => {
    const key = `test-${Math.random()}`;

    expect(rateLimit(key, 5, 60_000).remaining).toBe(4);

    expect(rateLimit(key, 5, 60_000).remaining).toBe(3);
  });

  it("isolates buckets per key", () => {
    const a = `a-${Math.random()}`;

    const b = `b-${Math.random()}`;

    rateLimit(a, 1, 60_000);

    expect(rateLimit(a, 1, 60_000).allowed).toBe(false);

    expect(rateLimit(b, 1, 60_000).allowed).toBe(true);
  });
});
