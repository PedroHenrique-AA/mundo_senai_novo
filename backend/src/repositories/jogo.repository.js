import { knex } from "../database/knex.js";

class JogoRepository {
  async getAll(filtros = {}) {
    const { busca, plataforma, precoMin, precoMax } = filtros;
    const ordenar = ["titulo", "preco", "data_lancamento"].includes(filtros.ordenar) ? filtros.ordenar : "titulo";
    const direcao = filtros.direcao === "desc" ? "desc" : "asc";
    const pagina = Math.max(1, Math.min(100000, Number.parseInt(filtros.pagina, 10) || 1));
    const limite = Math.max(1, Math.min(500, Number.parseInt(filtros.limite, 10) || 100));
    const query = knex("jogos").select("id", "titulo", "plataforma", "preco", "data_lancamento");
    if (busca) query.whereILike("titulo", `%${busca}%`);
    if (plataforma) query.whereILike("plataforma", plataforma);
    if (precoMin !== undefined && precoMin !== "") query.where("preco", ">=", Number(precoMin));
    if (precoMax !== undefined && precoMax !== "") query.where("preco", "<=", Number(precoMax));
    const totalQuery = query.clone().clearSelect().count({ total: "id" }).first();
    const [jogos, contagem] = await Promise.all([
      query.orderBy(ordenar, direcao).limit(Number(limite)).offset((Number(pagina) - 1) * Number(limite)),
      totalQuery,
    ]);
    return { dados: jogos, total: Number(contagem.total), pagina: Number(pagina), limite: Number(limite) };
  }
  async getById(id) { return knex("jogos").where({ id }).first(); }
  async create(dados) { const [jogo] = await knex("jogos").insert(dados).returning("*"); return jogo; }
  async delete(id) { const [jogo] = await knex("jogos").where({ id }).delete().returning("*"); return jogo; }
  async update(id, dados) { const [jogo] = await knex("jogos").where({ id }).update(dados).returning("*"); return jogo; }
}
export const jogoRepository = new JogoRepository();
