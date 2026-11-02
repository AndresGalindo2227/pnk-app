import type { BookingScope, MyBookingsResult } from './my-booking';
import type { MyBookingsCache, MyBookingsRemote } from './my-bookings.ports';

/**
 * HU-05: "Mis reservas" works offline.
 * 1. Ask the API; on success save the copy and return it as fresh.
 * 2. On a network failure return the saved copy marked as stale.
 * 3. With no network and no copy, the network error goes up (offline state).
 * Any other error (401, 500...) is not hidden behind old data.
 */
export class LoadMyBookingsUseCase {
  constructor(
    private readonly remote: MyBookingsRemote,
    private readonly cache: MyBookingsCache,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(scope: BookingScope): Promise<MyBookingsResult> {
    try {
      const items = await this.remote.list(scope);
      await this.cache.write(scope, items);
      return { items, savedAt: this.now().toISOString(), isStale: false };
    } catch (error) {
      if (!isNetworkError(error)) throw error;
      const cached = await this.cache.read(scope);
      if (!cached) throw error;
      return { items: cached.items, savedAt: cached.savedAt, isStale: true };
    }
  }

  /** Last saved copy, shown immediately while the API answers. */
  async cached(scope: BookingScope): Promise<MyBookingsResult | null> {
    const cached = await this.cache.read(scope);
    return cached ? { items: cached.items, savedAt: cached.savedAt, isStale: true } : null;
  }
}

function isNetworkError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { kind?: string }).kind === 'network';
}
