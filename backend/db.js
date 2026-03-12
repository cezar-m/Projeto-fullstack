import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const db = new Pool({
  host: "aws-1-us-east-2.pooler.supabase.com",
  port: 6543,
  user: "postgres.pivokxepxqugqwpkyxlw",
  password: "QMiYG7oSeoFqUmbH",
  database: "postgres",
  ssl: { rejectUnauthorized: false }
});

export default db;


