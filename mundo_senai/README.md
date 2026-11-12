# Mundo dos Jogos

Aplicação full-stack para cadastrar, pesquisar, filtrar, ordenar, editar e excluir jogos. O frontend usa React + Vite; a API usa Node.js, Express, Knex e PostgreSQL.

## Requisitos
- Node.js 18 ou superior
- PostgreSQL

## 1. Banco de dados
Crie um banco chamado `loja_jogos`. O backup original está em `backend/db/backup_jogos.sql` (formato de backup PostgreSQL customizado; restaure com `pg_restore`). Se preferir, crie a tabela manualmente:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS jogos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo varchar(150) NOT NULL,
  plataforma varchar(50) NOT NULL,
  preco numeric(10,2) NOT NULL CHECK (preco >= 0),
  data_lancamento date DEFAULT CURRENT_DATE
);
```

## 2. Backend
No terminal:

```bash
cd backend
npm install
```
Copie `.env.example` para `.env` e ajuste usuário, senha, porta e nome do banco conforme seu PostgreSQL. Depois:

```bash
npm run dev
```
A API ficará em `http://localhost:3000`. Teste `http://localhost:3000/health`.

## 3. Frontend
Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:5173`. Por padrão, o frontend chama `http://localhost:3000`. Para alterar, crie `frontend/.env` com `VITE_API_URL=http://localhost:3000`.

## Endpoints
| Método | Caminho | Ação |
|---|---|---|
| GET | `/jogo` | Lista jogos (busca, filtros, ordenação e paginação) |
| GET | `/jogo/:id` | Busca um jogo |
| POST | `/jogo` | Cadastra um jogo |
| PATCH | `/jogo/:id` | Atualiza campos de um jogo |
| DELETE | `/jogo/:id` | Exclui um jogo |
| GET | `/health` | Verifica API e conexão com o banco |

Exemplo de filtros: `/jogo?busca=mario&plataforma=PC&precoMin=10&precoMax=200&ordenar=preco&direcao=asc&pagina=1&limite=20`.

## Melhorias incluídas
- Conexão PostgreSQL configurada por variáveis de ambiente (sem credenciais no código).
- Consultas assíncronas aguardadas corretamente, validação de entrada e mensagens HTTP consistentes.
- Filtros, ordenação segura, paginação e contagem de resultados.
- CORS configurável, limite de payload, rota de saúde e tratamento centralizado de erros.
- Interface responsiva, busca instantânea, filtros, grade/lista e formulário CRUD.

As capas são artes abstratas geradas pela interface para manter o catálogo visual mesmo sem uma API externa de imagens. Os dados reais continuam vindo do PostgreSQL.
