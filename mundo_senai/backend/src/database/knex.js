import knexConfig from "knex";
import "dotenv/config";

export const knex = knexConfig({
  client: "pg",
  connection: {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "",
    database: process.env.PGDATABASE || "loja_jogos",
  },
  pool: { min: 0, max: 10 },
});
