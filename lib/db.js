import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || 'postgres://user:pass@localhost/db');

// q('select * from t where id = $1', [id]) -> array of rows
// @neondatabase/serverless 0.10.x: call the client as a function: sql(text, params)
export const q = (text, params = []) => sql(text, params);
