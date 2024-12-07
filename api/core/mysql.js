import database from 'mysql2/promise'

export const db = await database.createConnection(
  "mysql://root:root@localhost:8889/gladcode"
);
