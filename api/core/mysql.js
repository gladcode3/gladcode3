import database from "mysql2/promise";
import dotenv from 'dotenv';
dotenv.config();

export const db = await database.createConnection(
  process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/gladcode"
);
