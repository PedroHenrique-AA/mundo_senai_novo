import { jogoRepository } from "../repositories/jogo.repository.js";

const camposPermitidos = ["titulo", "plataforma", "preco", "data_lancamento"];

class JogoService {
  async getAll(filtros) { return jogoRepository.getAll(filtros); }
  async getById(id) {
    const jogo = await jogoRepository.getById(id);
    if (!jogo) throw Object.assign(new Error("Jogo não encontrado."), { status: 404 });
    return jogo;
  }
  validar(dados, parcial = false) {
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw Object.assign(new Error("Envie um objeto válido."), { status: 400 });
    const entrada = Object.fromEntries(Object.entries(dados).filter(([chave]) => camposPermitidos.includes(chave)));
    if (Object.keys(entrada).length === 0) throw Object.assign(new Error("Nenhum campo válido foi informado."), { status: 400 });
    if (!parcial || "titulo" in entrada) {
      if (typeof entrada.titulo !== "string" || !entrada.titulo.trim() || entrada.titulo.trim().length > 150) throw Object.assign(new Error("Título é obrigatório e deve ter até 150 caracteres."), { status: 400 });
      entrada.titulo = entrada.titulo.trim();
    }
    if (!parcial || "plataforma" in entrada) {
      if (typeof entrada.plataforma !== "string" || !entrada.plataforma.trim() || entrada.plataforma.trim().length > 50) throw Object.assign(new Error("Plataforma é obrigatória e deve ter até 50 caracteres."), { status: 400 });
      entrada.plataforma = entrada.plataforma.trim();
    }
    if (!parcial || "preco" in entrada) {
      const preco = Number(entrada.preco);
      if (!Number.isFinite(preco) || preco < 0 || preco > 99999999) throw Object.assign(new Error("Informe um preço válido e não negativo."), { status: 400 });
      entrada.preco = preco;
    }
    if ("data_lancamento" in entrada && !entrada.data_lancamento) delete entrada.data_lancamento;
    if ("data_lancamento" in entrada && entrada.data_lancamento) {
      const data = new Date(`${entrada.data_lancamento}T00:00:00`);
      if (Number.isNaN(data.getTime())) throw Object.assign(new Error("Data de lançamento inválida."), { status: 400 });
    }
    return entrada;
  }
  async create(dados) { return jogoRepository.create(this.validar(dados)); }
  async delete(id) {
    const jogo = await jogoRepository.delete(id);
    if (!jogo) throw Object.assign(new Error("Jogo não encontrado."), { status: 404 });
    return jogo;
  }
  async update(id, dados) {
    const atual = await this.getById(id);
    const entrada = this.validar(dados, true);
    const jogo = await jogoRepository.update(id, entrada);
    return jogo || atual;
  }
}
export const jogoService = new JogoService();
