import { drizzle } from 'drizzle-orm/node-postgres';
import { getTableName } from 'drizzle-orm';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

declare global {
  var _postgresPool: pg.Pool | undefined;
  var _inMemoryTables: Map<string, any[]> | undefined;
}

const memoryTables: Map<string, any[]> = global._inMemoryTables || new Map();
if (!global._inMemoryTables) {
  global._inMemoryTables = memoryTables;
}

function getStore(table: any): any[] {
  const name = getTableName(table);
  if (!memoryTables.has(name)) {
    memoryTables.set(name, []);
  }
  return memoryTables.get(name)!;
}

function matchCondition(row: any, cond: any): boolean {
  if (!cond) return true;
  if (cond.queryChunks) {
    const colChunk = cond.queryChunks.find((c: any) => c && c.name && (c.table || c.columnType));
    const paramChunk = cond.queryChunks.find((c: any) => c && 'value' in c && c.encoder);
    if (colChunk && paramChunk) {
      const colName = colChunk.name;
      const camel = colName.replace(/_([a-z])/g, (_: any, g: string) => g.toUpperCase());
      const val = row[colName] !== undefined ? row[colName] : row[camel];
      return String(val) === String(paramChunk.value);
    }
  }
  return true;
}

const createMockDb = () => {
  return {
    select: () => ({
      from: (table: any) => {
        let cond: any = null;
        let limitCount: number | null = null;
        const builder: any = {
          where: (c: any) => { cond = c; return builder; },
          limit: (l: number) => { limitCount = l; return builder; },
          then: (onfulfilled?: any, onrejected?: any) => {
            let rows = [...getStore(table)];
            if (cond) rows = rows.filter(r => matchCondition(r, cond));
            if (limitCount != null) rows = rows.slice(0, limitCount);
            return Promise.resolve(rows).then(onfulfilled, onrejected);
          }
        };
        return builder;
      }
    }),
    insert: (table: any) => ({
      values: (vals: any) => {
        const store = getStore(table);
        const items = Array.isArray(vals) ? vals : [vals];
        let inserted: any[] = [];
        let conflictHandler: any = null;

        const builder: any = {
          onConflictDoUpdate: (config: any) => {
            conflictHandler = config;
            return builder;
          },
          returning: () => builder,
          then: (onfulfilled?: any, onrejected?: any) => {
            for (const item of items) {
              const newItem = { ...item };
              if (!newItem.id && newItem.id !== 0) {
                newItem.id = store.length + 1;
              }
              if (conflictHandler && conflictHandler.target) {
                const targetCol = conflictHandler.target.name || 'uid';
                const targetVal = newItem[targetCol] || newItem.uid;
                const existingIdx = store.findIndex((r: any) => (r[targetCol] || r.uid) === targetVal);
                if (existingIdx >= 0) {
                  const updated = { ...store[existingIdx], ...conflictHandler.set };
                  store[existingIdx] = updated;
                  inserted.push(updated);
                  continue;
                }
              }
              store.push(newItem);
              inserted.push(newItem);
            }
            return Promise.resolve(inserted).then(onfulfilled, onrejected);
          }
        };
        return builder;
      }
    }),
    update: (table: any) => ({
      set: (data: any) => {
        const store = getStore(table);
        let cond: any = null;
        const builder: any = {
          where: (c: any) => { cond = c; return builder; },
          returning: () => builder,
          then: (onfulfilled?: any, onrejected?: any) => {
            const updated: any[] = [];
            for (let i = 0; i < store.length; i++) {
              if (matchCondition(store[i], cond)) {
                store[i] = { ...store[i], ...data };
                updated.push(store[i]);
              }
            }
            return Promise.resolve(updated).then(onfulfilled, onrejected);
          }
        };
        return builder;
      }
    }),
    delete: (table: any) => ({
      where: (cond: any) => {
        const store = getStore(table);
        const remaining = store.filter((r: any) => !matchCondition(r, cond));
        memoryTables.set(getTableName(table), remaining);
        return Promise.resolve({ rowCount: store.length - remaining.length });
      }
    }),
    execute: async () => ({ rows: [] })
  };
};

let dbInstance: any;

const isPostgresConfigured = Boolean(process.env.SQL_HOST || process.env.DATABASE_URL);

if (isPostgresConfigured) {
  try {
    if (!global._postgresPool) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        connectionString: process.env.DATABASE_URL,
        max: 10,
        connectionTimeoutMillis: 5000,
      });

      global._postgresPool.on('error', (err: Error) => {
        console.warn('Unexpected error on idle SQL pool client:', err.message);
      });
    }

    dbInstance = drizzle(global._postgresPool, { schema });
  } catch (err) {
    console.warn('[AI Studio] PostgreSQL connection failed, switching to in-memory mock store:', err);
    dbInstance = createMockDb();
  }
} else {
  console.log('[AI Studio] PostgreSQL not configured — using fast in-memory civic database store');
  dbInstance = createMockDb();
}

export const db = dbInstance;
export const createPool = () => global._postgresPool;

