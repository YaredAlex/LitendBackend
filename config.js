import pg from "pg";
import "dotenv/config.js";
const { Pool } = pg;
let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
PGPASSWORD = decodeURIComponent(PGPASSWORD);

const config = {
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
    ssl: true,
  },
};

const pool = new Pool(config);

export { pool };
// const config = {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   database: process.env.DB,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// };
