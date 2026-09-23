import { describe, expect, it } from "vitest";

import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const encoded = await hashPassword("CorrectHorse1!");

    expect(encoded).toMatch(/^scrypt\$\d+\$\d+\$\d+\$[a-f0-9]+\$[a-f0-9]+$/);

    await expect(
      verifyPassword("CorrectHorse1!", encoded),
    ).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const encoded = await hashPassword("CorrectHorse1!");

    await expect(
      verifyPassword("wrong-password", encoded),
    ).resolves.toBe(false);
  });

  it("produces a unique salt per hash", async () => {
    const a = await hashPassword("same-password");

    const b = await hashPassword("same-password");

    expect(a).not.toBe(b);
  });

  it("rejects malformed encoded values", async () => {
    await expect(verifyPassword("x", "not-a-hash")).resolves.toBe(false);

    await expect(
      verifyPassword("x", "scrypt$abc$8$1$zz$ff"),
    ).resolves.toBe(false);

    await expect(
      verifyPassword("x", "md5$32768$8$1$ab$ab"),
    ).resolves.toBe(false);
  });
});
