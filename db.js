// db.js — IndexedDB cache with TTL
const DB_NAME = 'webtv';
const DB_VER  = 1;
const STORE   = 'cache';

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = () => reject(req.error);
  });
}

async function dbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbSet(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// TTL in seconds
export async function cacheGet(key, ttl = 3600) {
  try {
    const entry = await dbGet(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > ttl * 1000) return null;
    return entry.data;
  } catch { return null; }
}

export async function cacheSet(key, data) {
  try { await dbSet(key, { ts: Date.now(), data }); } catch { /* ignore */ }
}

export async function cacheClear() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}
