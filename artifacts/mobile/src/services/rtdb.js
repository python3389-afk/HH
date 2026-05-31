/**
 * Firestore-backed data service.
 *
 * Each logical path maps to a Firestore document in the `_rtdb` collection.
 * Document ID  = path segments joined with "__"   (e.g. "users__uid__profile")
 * Data stored under the `_v` key so Firestore never sees undefined values.
 *
 * Example:
 *   path  "users/abc123/profile"
 *   → doc  _rtdb / users__uid__profile
 *   → { _v: { name, email, … } }
 *
 * Firestore provides:
 *  • Real-time listeners (onSnapshot)
 *  • Offline cache – persistent (IndexedDB) on web, memory on native
 *  • Automatic conflict-free cross-device sync
 */
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  onSnapshot,
} from 'firebase/firestore';
import { fs } from '../config/firebase';

// ─── Internal helpers ────────────────────────────────────────────────────────

const COL = '_rtdb';

/** Convert a slash-separated path to a stable Firestore doc ID. */
function pathToId(path) {
  return String(path).replace(/\//g, '__');
}

/** Get the Firestore DocumentReference for a logical path. */
function pathToRef(path) {
  return doc(fs, COL, pathToId(path));
}

/** Deep-clean a value: remove undefined, coerce non-finite numbers to null. */
function sanitize(val) {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') {
    if (typeof val === 'number' && !isFinite(val)) return null;
    return val;
  }
  if (Array.isArray(val)) return val.map(sanitize);
  const out = {};
  for (const [k, v] of Object.entries(val)) {
    const clean = sanitize(v);
    if (clean !== undefined) out[k] = clean;
  }
  return out;
}

// ─── PATHS ───────────────────────────────────────────────────────────────────

export const PATHS = {
  catalog: 'catalog',
  catalogMeta: 'catalog/meta',
  catalogServices: 'catalog/services',
  catalogProviders: 'catalog/providers',
  catalogHomeCategories: 'catalog/homeCategories',
  catalogServiceCategories: 'catalog/serviceCategories',
  catalogConfig: 'catalog/config',
  catalogDefaultNotifications: 'catalog/defaultNotifications',
  catalogBanners: 'catalog/banners',
  vendorRegistrations: 'vendorRegistrations',
  adminInbox: 'adminInbox',
  userProfile: (uid) => `users/${uid}/profile`,
  userBookings: (uid) => `users/${uid}/bookings`,
  userNotifications: (uid) => `users/${uid}/notifications`,
  userNotificationMeta: (uid) => `users/${uid}/notificationMeta`,
  userBookmarks: (uid) => `users/${uid}/bookmarks`,
  userChatHistory: (uid) => `users/${uid}/chatHistory`,
};

// ─── Array / Map helpers ─────────────────────────────────────────────────────

export function mapToArray(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).map(([key, value]) => ({
    ...value,
    id: value?.id ?? key,
  }));
}

export function arrayToMap(arr) {
  return (arr || []).reduce((acc, item) => {
    if (item?.id) acc[item.id] = { ...item };
    return acc;
  }, {});
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/**
 * One-time read. Returns the value at `path`, or null if not found.
 */
export async function dbGet(path) {
  try {
    const snap = await getDoc(pathToRef(path));
    if (!snap.exists()) return null;
    return snap.data()?._v ?? null;
  } catch (e) {
    console.warn('dbGet error:', path, e?.message);
    return null;
  }
}

/**
 * Write (replace) the full value at `path`.
 */
export async function dbSet(path, value) {
  try {
    await setDoc(pathToRef(path), { _v: sanitize(value) });
  } catch (e) {
    console.warn('dbSet error:', path, e?.message);
    throw e;
  }
}

/**
 * Partial update — merges top-level keys into the stored value.
 * Supports dotted-key notation: { 'bookingId.status': 'completed' }.
 * Pass null as a field value to delete that field.
 */
export async function dbUpdate(path, updates) {
  try {
    const sanitized = sanitize(updates);
    const dotted = {};
    for (const [k, v] of Object.entries(sanitized)) {
      dotted[`_v.${k}`] = v === null ? deleteField() : v;
    }
    await updateDoc(pathToRef(path), dotted);
  } catch (e) {
    if (e?.code === 'not-found') {
      await dbSet(path, sanitize(updates));
      return;
    }
    console.warn('dbUpdate error:', path, e?.message);
    throw e;
  }
}

/**
 * Delete the node at `path`.
 */
export async function dbRemove(path) {
  try {
    await deleteDoc(pathToRef(path));
  } catch (e) {
    console.warn('dbRemove error:', path, e?.message);
  }
}

/**
 * Push a new child under `path` with a unique key.
 * Reads the existing map, adds the new item, then writes the whole map back.
 * Returns the generated key.
 */
export async function dbPush(path, value) {
  try {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const existing = (await dbGet(path)) ?? {};
    const updated = { ...existing, [id]: sanitize({ ...value, id }) };
    await dbSet(path, updated);
    return id;
  } catch (e) {
    console.warn('dbPush error:', path, e?.message);
    throw e;
  }
}

/**
 * Real-time listener — fires immediately with current data then on every change.
 * Returns an unsubscribe function.
 */
export function dbListen(path, callback) {
  const unsubscribe = onSnapshot(
    pathToRef(path),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback(snap.data()?._v ?? null);
    },
    (err) => {
      console.warn('dbListen error:', path, err?.message);
      callback(null);
    },
  );
  return unsubscribe;
}

/** Exposed for callers that need a raw DocumentReference. */
export function dbRef(path) {
  return pathToRef(path);
}
