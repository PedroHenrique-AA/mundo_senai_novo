import knexConfig from "knex";
import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,
    }
  : {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "",
      database: process.env.PGDATABASE || "loja_jogos",
      ssl: isProduction
        ? { rejectUnauthorized: false }
        : false,
    };

export const knex = knexConfig({
  client: "pg",
  connection,
  pool: {
    min: 0,
    max: 1,
  },
}); 