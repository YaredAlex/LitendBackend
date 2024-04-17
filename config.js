import pg from "pg";
import "dotenv/config.js";
const { Pool } = pg;
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};
const pool = new Pool(config);

export { pool };
