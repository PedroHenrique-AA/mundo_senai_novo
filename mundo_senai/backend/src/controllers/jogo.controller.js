import { jogoService } from "../services/jogo.service.js";

class JogoController {
  async getAll(req, res, next) { try { res.json(await jogoService.getAll(req.query)); } catch (e) { next(e); } }
  async getById(req, res, next) { try { res.json(await jogoService.getById(req.params.id)); } catch (e) { next(e); } }
  async create(req, res, next) { try { res.status(201).json(await jogoService.create(req.body)); } catch (e) { next(e); } }
  async delete(req, res, next) { try { res.json({ mensagem: "Jogo excluído com sucesso.", jogo: await jogoService.delete(req.params.id) }); } catch (e) { next(e); } }
  async update(req, res, next) { try { res.json(await jogoService.update(req.params.id, req.body)); } catch (e) { next(e); } }
}
export const jogoController = new JogoController();
