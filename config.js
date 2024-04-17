import pg from "pg";
const { Pool } = pg;
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "litend",
  password: "root",
  port: 5432,
});

export { pool };
