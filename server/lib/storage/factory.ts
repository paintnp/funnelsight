import type { IStorage } from './types.js';
import { MemoryStorage } from './mem-storage.js';
import { DatabaseStorage } from './database-storage.js';

// Lazy instance holder
let instance: IStorage | null = null;

function createStorage(): IStorage {
  const mode = process.env.STORAGE_MODE || 'memory';

  console.log(`💾 [Storage Factory] Initializing in ${mode} mode`);

  if (mode === 'database') {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  [Storage Factory] Missing DATABASE_URL, falling back to memory');
      return new MemoryStorage();
    }
    return new DatabaseStorage();
  }

  return new MemoryStorage();
}

// Lazy Proxy: delays initialization until first access
export const storage: IStorage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!instance) {
      instance = createStorage();
    }
    return instance[prop as keyof IStorage];
  }
}) as IStorage;
