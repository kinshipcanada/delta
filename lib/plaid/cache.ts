import { Institution } from 'plaid';

interface CacheEntry<T> {
  data: T;
  expiry: number;
  lastAttempt?: number;
}

interface RetryState {
  attempts: number;
  lastError?: Error;
  nextRetryTime: number;
}

class PlaidCache {
  private static instance: PlaidCache;
  private institutionCache: Map<string, CacheEntry<Institution>>;
  private itemCache: Map<string, CacheEntry<any>>;
  private retryStates: Map<string, RetryState>;
  
  private readonly INSTITUTION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly ITEM_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly BASE_RETRY_DELAY = 1000; // 1 second
  private readonly MAX_RETRY_DELAY = 32000; // 32 seconds

  private constructor() {
    this.institutionCache = new Map();
    this.itemCache = new Map();
    this.retryStates = new Map();
  }

  public static getInstance(): PlaidCache {
    if (!PlaidCache.instance) {
      PlaidCache.instance = new PlaidCache();
    }
    return PlaidCache.instance;
  }

  private getRetryDelay(attempts: number): number {
    return Math.min(
      this.BASE_RETRY_DELAY * Math.pow(2, attempts),
      this.MAX_RETRY_DELAY
    );
  }

  private canRetry(key: string, type: 'institution' | 'item'): boolean {
    const state = this.retryStates.get(key);
    if (!state) return true;

    const now = Date.now();
    if (now < state.nextRetryTime) {
      return false;
    }

    return state.attempts < this.MAX_RETRIES;
  }

  private updateRetryState(key: string, success: boolean, error?: Error) {
    let state = this.retryStates.get(key) || {
      attempts: 0,
      nextRetryTime: 0
    };

    if (success) {
      // Reset on success
      this.retryStates.delete(key);
      return;
    }

    state.attempts++;
    state.lastError = error;
    state.nextRetryTime = Date.now() + this.getRetryDelay(state.attempts);
    this.retryStates.set(key, state);
  }

  public async getInstitution(
    institutionId: string,
    fetchFn: () => Promise<Institution>
  ): Promise<Institution> {
    const cached = this.institutionCache.get(institutionId);
    const now = Date.now();

    // Return cached data if valid
    if (cached && cached.expiry > now) {
      return cached.data;
    }

    // Check if we can make a new request
    if (!this.canRetry(institutionId, 'institution')) {
      const state = this.retryStates.get(institutionId);
      throw new Error(`Rate limited. Try again in ${Math.ceil((state!.nextRetryTime - now) / 1000)} seconds`);
    }

    try {
      const data = await fetchFn();
      this.institutionCache.set(institutionId, {
        data,
        expiry: now + this.INSTITUTION_CACHE_DURATION
      });
      this.updateRetryState(institutionId, true);
      return data;
    } catch (error) {
      this.updateRetryState(institutionId, false, error as Error);
      throw error;
    }
  }

  public async getItem(
    itemId: string,
    fetchFn: () => Promise<any>
  ): Promise<any> {
    const cached = this.itemCache.get(itemId);
    const now = Date.now();

    // Return cached data if valid
    if (cached && cached.expiry > now) {
      return cached.data;
    }

    // Check if we can make a new request
    if (!this.canRetry(itemId, 'item')) {
      const state = this.retryStates.get(itemId);
      throw new Error(`Rate limited. Try again in ${Math.ceil((state!.nextRetryTime - now) / 1000)} seconds`);
    }

    try {
      const data = await fetchFn();
      this.itemCache.set(itemId, {
        data,
        expiry: now + this.ITEM_CACHE_DURATION
      });
      this.updateRetryState(itemId, true);
      return data;
    } catch (error) {
      this.updateRetryState(itemId, false, error as Error);
      throw error;
    }
  }

  public clearCache() {
    this.institutionCache.clear();
    this.itemCache.clear();
    this.retryStates.clear();
  }
}

export const plaidCache = PlaidCache.getInstance(); 