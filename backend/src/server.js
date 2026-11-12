import express from "express";
import cors from "cors";
import { jogoRouter } from "./routes/jogo.route.js";
import { knex } from "./database/knex.js";

const app = express();
const port = Number(process.env.PORT || 3000);
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/", (_req, res) => res.json({ nome: "Mundo dos Jogos API", status: "online", endpoints: ["/jogo"] }));
app.get("/health", async (_req, res) => {
  try { await knex.raw("select 1"); res.json({ status: "ok", database: "connected" }); }
  catch { res.status(503).json({ status: "error", database: "disconnected" }); }
});
app.use("/jogo", jogoRouter);
app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada." }));
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || (err.code === "23505" ? 409 : err.code === "23502" || err.code === "22P02" ? 400 : 500);
  res.status(status).json({ erro: status === 500 ? "Erro interno do servidor." : err.message });
});
export default app;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`API disponível em http://localhost:${port}`);
  });
}
