export class ClientCache {
    private cache = new Map<string, { data: any; expiry: number }>();

    set(key: string, data: any, ttlMs: number = 60000) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttlMs,
        });
    }

    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }
}

export const clientCache = new ClientCache();
