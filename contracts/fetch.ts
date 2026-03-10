const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function readWithRetry<T>(
    fn: () => Promise<T>,
    options?: { retries?: number; baseDelayMs?: number; maxDelayMs?: number },
) {
    const retries = options?.retries ?? 4;
    const baseDelayMs = options?.baseDelayMs ?? 350;
    const maxDelayMs = options?.maxDelayMs ?? 4000;

    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            return await fn();
        } catch (err: any) {
            const msg = (err?.message || "").toLowerCase();
            const isRateLimit = msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests");
            const isRetryable =
                isRateLimit ||
                msg.includes("timeout") ||
                msg.includes("temporarily unavailable") ||
                msg.includes("fetch failed") ||
                msg.includes("network");

            if (attempt >= retries || !isRetryable) {
                throw err;
            }

            const backoff = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
            const jitter = Math.floor(Math.random() * (backoff * 0.2));
            const delay = backoff + jitter;
            attempt += 1;
            await sleep(delay);
        }
    }
}