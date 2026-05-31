import { dbGet, dbSet, PATHS } from '../services/rtdb';
import { buildCatalogSeed } from './seedCatalog';

const CATALOG_VERSION = 4;

export async function seedCatalogIfNeeded() {
  const meta = await dbGet(PATHS.catalogMeta);
  if (meta?.seeded && (meta?.version || 0) >= CATALOG_VERSION) {
    return false;
  }
  const seed = buildCatalogSeed();
  seed.meta = { ...seed.meta, version: CATALOG_VERSION, seeded: true };
  await dbSet(PATHS.catalog, seed);
  return true;
}
