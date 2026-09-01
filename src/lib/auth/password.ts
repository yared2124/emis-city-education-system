import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const COST = 32_768;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");

  const derived = (await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: 128 * COST * BLOCK_SIZE + 1024 * 1024,
  })) as Buffer;

  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt,
    derived.toString("hex"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  try {
    const parts = encoded.split("$");

    if (parts.length !== 6) {
      return false;
    }

    const [algorithm, cost, blockSize, parallelization, salt, storedHash] =
      parts;

    if (
      algorithm !== "scrypt" ||
      !/^\d+$/.test(cost) ||
      !/^\d+$/.test(blockSize) ||
      !/^\d+$/.test(parallelization) ||
      !/^[a-f0-9]+$/i.test(storedHash) ||
      storedHash.length % 2 !== 0
    ) {
      return false;
    }

    const derived = (await scrypt(password, salt, storedHash.length / 2, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization),
      maxmem: 128 * Number(cost) * Number(blockSize) + 1024 * 1024,
    })) as Buffer;

    const expected = Buffer.from(storedHash, "hex");

    return (
      expected.length === derived.length && timingSafeEqual(expected, derived)
    );
  } catch {
    return false;
  }
}
