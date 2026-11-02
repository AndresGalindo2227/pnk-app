import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/** Prefix of every cached key, so the whole cache can be wiped on sign-out (persistence.md). */
export const CACHE_PREFIX = 'pnk.cache.';

/** Cached value plus the moment it was saved, to show "actualizado hace X min". */
export interface CachedValue<T> {
  readonly savedAt: string;
  readonly value: T;
}

/**
 * Small key-value cache on Capacitor Preferences (ADR-008). Only non-sensitive data:
 * tokens never go here, they live in secure storage.
 */
@Injectable({ providedIn: 'root' })
export class LocalCache {
  async read<T>(key: string): Promise<CachedValue<T> | null> {
    const { value } = await Preferences.get({ key: CACHE_PREFIX + key });
    if (!value) return null;
    try {
      return JSON.parse(value) as CachedValue<T>;
    } catch {
      await Preferences.remove({ key: CACHE_PREFIX + key }); // corrupted or old format: rebuild from the API
      return null;
    }
  }

  async write<T>(key: string, value: T): Promise<void> {
    const entry: CachedValue<T> = { savedAt: new Date().toISOString(), value };
    await Preferences.set({ key: CACHE_PREFIX + key, value: JSON.stringify(entry) });
  }

  /** Deletes every cached entry (called on sign-out). */
  async clearAll(): Promise<void> {
    const { keys } = await Preferences.keys();
    await Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX)).map((key) => Preferences.remove({ key })));
  }
}
