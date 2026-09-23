type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

let lastSweepAt = Date.now();

const SWEEP_INTERVAL_MS = 60 * 1000;

const BUCKET_TTL_MS = 15 * 60 * 1000;

function sweep(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) {
    return;
  }

  lastSweepAt = now;

  for (const [key, bucket] of buckets) {
    const newest = bucket.timestamps[bucket.timestamps.length - 1];

    if (newest === undefined || now - newest > BUCKET_TTL_MS) {
      buckets.delete(key);
    }
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Sliding-window rate limiter backed by the process's memory.
 *
 * Suitable for a single-instance deployment. When scaling horizontally,
 * replace with a shared store (e.g. Redis) using the same interface.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  sweep(now);

  const bucket = buckets.get(key) ?? {
    timestamps: [],
  };

  const windowStart = now - windowMs;

  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);

    const oldest = bucket.timestamps[0];

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.timestamps.push(now);

  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: limit - bucket.timestamps.length,
    retryAfterSeconds: 0,
  };
}
