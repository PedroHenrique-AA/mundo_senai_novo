import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Plus, Gamepad2, Sparkles, LayoutGrid, List, ArrowUpDown, Pencil, Trash2, X, CalendarDays, Monitor, RefreshCw, AlertCircle, ChevronDown, Gamepad } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const money = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = value => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR') : 'Não informado';
const palettes = ['violet','blue','pink','orange','green','cyan'];
const gradients = ['linear-gradient(135deg,#4c1d95,#a855f7 55%,#f0abfc)','linear-gradient(135deg,#0c4a6e,#0ea5e9 55%,#67e8f9)','linear-gradient(135deg,#831843,#ec4899 55%,#fda4af)','linear-gradient(135deg,#7c2d12,#f97316 55%,#fde68a)','linear-gradient(135deg,#14532d,#22c55e 55%,#bbf7d0)','linear-gradient(135deg,#164e63,#06b6d4 55%,#a5f3fc)'];

function GameArt({ game, index = 0, compact = false }) {
  const gradient = gradients[index % gradients.length];
  return <div className={`game-art ${compact ? 'compact' : ''}`} style={{ background: gradient }}>
    <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-glow"/>
    <div className="art-console"><Gamepad2 size={compact ? 32 : 54} strokeWidth={1.2}/></div>
    <span className="art-platform">{game.plataforma || 'MULTIPLATAFORMA'}</span>
  </div>;
}

function Modal({ game, onClose, onSave, saving }) {
  const [form, setForm] = useState({ titulo: game?.titulo || '', plataforma: game?.plataforma || 'PC', preco: game?.preco ?? '', data_lancamento: game?.data_lancamento ? String(game.data_lancamento).slice(0,10) : '' });
  const [error, setError] = useState('');
  const change = e => setForm(old => ({ ...old, [e.target.name]: e.target.value }));
  async function submit(e) { e.preventDefault(); setError(''); if (!form.titulo.trim() || !form.plataforma.trim() || form.preco === '' || Number(form.preco) < 0) return setError('Preencha título, plataforma e preço corretamente.'); try { await onSave({ ...form, preco: Number(form.preco) }); } catch (err) { setError(err.message); } }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><form className="modal" onSubmit={submit}>
    <div className="modal-head"><div><span className="eyebrow">BIBLIOTECA</span><h2>{game ? 'Editar jogo' : 'Adicionar jogo'}</h2><p>Preencha os detalhes para atualizar seu catálogo.</p></div><button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button></div>
    <label>Nome do jogo<input autoFocus name="titulo" maxLength="150" placeholder="Ex.: Elden Ring" value={form.titulo} onChange={change}/></label>
    <div className="form-row"><label>Plataforma<select name="plataforma" value={form.plataforma} onChange={change}>{['PC','PlayStation 5','PlayStation 4','Xbox Series X/S','Xbox One','Nintendo Switch','Mobile','Multiplataforma'].map(x=><option key={x}>{x}</option>)}</select></label><label>Preço (R$)<input name="preco" type="number" min="0" step="0.01" placeholder="199.90" value={form.preco} onChange={change}/></label></div>
    <label>Data de lançamento<input name="data_lancamento" type="date" value={form.data_lancamento} onChange={change}/></label>
    {error && <div className="form-error"><AlertCircle size={16}/>{error}</div>}
    <div className="modal-actions"><button type="button" className="btn ghost" onClick={onClose}>Cancelar</button><button className="btn primary" disabled={saving}>{saving ? 'Salvando...' : game ? 'Salvar alterações' : 'Adicionar à biblioteca'}</button></div>
  </form></div>;
}

export default function App() {
  const [games, setGames] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [search, setSearch] = useState(''); const [platform, setPlatform] = useState('Todas'); const [sort, setSort] = useState('titulo-asc'); const [minPrice, setMinPrice] = useState(''); const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false); const [view, setView] = useState('grid'); const [modal, setModal] = useState(null); const [saving, setSaving] = useState(false); const [toast, setToast] = useState('');

  const loadGames = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await fetch(`${API}/jogo?limite=500`); if (!response.ok) throw new Error('Não foi possível carregar os jogos.'); const data = await response.json(); setGames(Array.isArray(data) ? data : data.dados || []); }
    catch (err) { setError(`${err.message} Confira se o backend e o PostgreSQL estão ligados.`); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadGames(); }, [loadGames]);
  const platforms = useMemo(() => ['Todas', ...new Set(games.map(g => g.plataforma).filter(Boolean).sort())], [games]);
  const filtered = useMemo(() => {
    const list = games.filter(g => g.titulo.toLowerCase().includes(search.toLowerCase()) && (platform === 'Todas' || g.plataforma === platform) && (minPrice === '' || Number(g.preco) >= Number(minPrice)) && (maxPrice === '' || Number(g.preco) <= Number(maxPrice)));
    const [field, direction] = sort.split('-'); return list.sort((a,b) => { let av = field === 'data' ? (a.data_lancamento || '') : field === 'preco' ? Number(a.preco) : a.titulo.toLowerCase(); let bv = field === 'data' ? (b.data_lancamento || '') : field === 'preco' ? Number(b.preco) : b.titulo.toLowerCase(); return (av < bv ? -1 : av > bv ? 1 : 0) * (direction === 'desc' ? -1 : 1); });
  }, [games, search, platform, sort, minPrice, maxPrice]);
  const notify = message => { setToast(message); window.setTimeout(() => setToast(''), 2800); };
  async function saveGame(data) { setSaving(true); try { const editing = Boolean(modal?.id); const response = await fetch(editing ? `${API}/jogo/${modal.id}` : `${API}/jogo`, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.erro || 'Não foi possível salvar.'); setModal(null); await loadGames(); notify(editing ? 'Jogo atualizado com sucesso!' : 'Jogo adicionado à biblioteca!'); } finally { setSaving(false); } }
  async function deleteGame(game) { if (!window.confirm(`Excluir "${game.titulo}" da biblioteca?`)) return; try { const response = await fetch(`${API}/jogo/${game.id}`, { method: 'DELETE' }); const result = await response.json(); if (!response.ok) throw new Error(result.erro || 'Falha ao excluir.'); setGames(old => old.filter(g => g.id !== game.id)); notify('Jogo removido da biblioteca.'); } catch (err) { notify(err.message); } }
  const clearFilters = () => { setSearch(''); setPlatform('Todas'); setMinPrice(''); setMaxPrice(''); setSort('titulo-asc'); };

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#inicio"><span className="brand-mark"><Gamepad2 size={23}/></span><span>MUNDO<span className="brand-accent">DOS</span>JOGOS</span></a><nav><a className="nav-active" href="#catalogo">Explorar</a><a href="#catalogo">Biblioteca</a></nav><div className="top-actions"><span className="status"><i/> Catálogo conectado</span><button className="btn primary add-top" onClick={() => setModal({})}><Plus size={17}/> Novo jogo</button></div></header>
    <main id="inicio">
      <section className="hero"><div className="hero-copy"><div className="hero-kicker"><Sparkles size={14}/> SEU PRÓXIMO UNIVERSO COMEÇA AQUI</div><h1>Encontre seu<br/><span>próximo jogo.</span></h1><p>Explore títulos, descubra novidades e organize sua coleção em um só lugar.</p><a className="hero-link" href="#catalogo">Explorar catálogo <span>↗</span></a></div><div className="hero-visual"><div className="hero-ring ring-a"/><div className="hero-ring ring-b"/><div className="hero-gamepad"><Gamepad2 size={150} strokeWidth={0.8}/></div><div className="float-chip chip-one"><span>✦</span> PLAY YOUR WAY</div><div className="float-chip chip-two">LEVEL UP <b>＋</b></div><div className="hero-spark spark-a">✳</div><div className="hero-spark spark-b">✦</div></div><div className="hero-index">01 <span/> 03</div></section>
      <section className="stats-row"><div className="stat"><span className="stat-icon"><Gamepad2 size={18}/></span><div><strong>{games.length}</strong><small>JOGOS NO CATÁLOGO</small></div></div><div className="stat"><span className="stat-icon"><Monitor size={18}/></span><div><strong>{platforms.length - 1}</strong><small>PLATAFORMAS</small></div></div><div className="stat"><span className="stat-icon"><Sparkles size={18}/></span><div><strong>{filtered.length}</strong><small>RESULTADOS ENCONTRADOS</small></div></div><div className="stats-note">Uma biblioteca feita para quem ama jogar.</div></section>
      <section className="catalog" id="catalogo"><div className="section-heading"><div><span className="eyebrow">DESCUBRA E ORGANIZE</span><h2>Explore o catálogo<span>.</span></h2><p>Todos os seus jogos favoritos, reunidos em um só lugar.</p></div><button className="btn outline" onClick={() => setModal({})}><Plus size={17}/> Adicionar jogo</button></div>
        <div className="toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome do jogo..."/><kbd>⌕</kbd></div><button className={`filter-toggle ${showFilters ? 'selected' : ''}`} onClick={() => setShowFilters(v => !v)}><SlidersHorizontal size={17}/> Filtros {(platform !== 'Todas' || minPrice || maxPrice) && <i/>}</button><div className="sort-box"><ArrowUpDown size={16}/><select value={sort} onChange={e => setSort(e.target.value)}><option value="titulo-asc">Nome: A–Z</option><option value="titulo-desc">Nome: Z–A</option><option value="preco-asc">Menor preço</option><option value="preco-desc">Maior preço</option><option value="data-desc">Mais recentes</option><option value="data-asc">Mais antigos</option></select><ChevronDown size={14}/></div><div className="view-switch"><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Visualização em grade"><LayoutGrid size={17}/></button><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="Visualização em lista"><List size={18}/></button></div></div>
        {showFilters && <div className="filter-panel"><label>Plataforma<select value={platform} onChange={e => setPlatform(e.target.value)}>{platforms.map(p => <option key={p}>{p}</option>)}</select></label><label>Preço mínimo<input type="number" min="0" placeholder="R$ 0" value={minPrice} onChange={e => setMinPrice(e.target.value)}/></label><label>Preço máximo<input type="number" min="0" placeholder="Sem limite" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/></label><button className="clear-btn" onClick={clearFilters}>Limpar filtros</button></div>}
        <div className="results-line"><span>Mostrando <b>{filtered.length}</b> {filtered.length === 1 ? 'jogo' : 'jogos'}</span><span className="results-category">{platform === 'Todas' ? 'TODAS AS PLATAFORMAS' : platform.toUpperCase()}</span></div>
        {error && <div className="error-panel"><AlertCircle size={20}/><div><b>Não foi possível conectar à API</b><p>{error}</p></div><button className="btn outline" onClick={loadGames}><RefreshCw size={15}/> Tentar novamente</button></div>}
        {loading ? <div className="loading"><div className="spinner"/><span>Carregando sua biblioteca...</span></div> : !error && filtered.length === 0 ? <div className="empty"><div className="empty-icon"><Gamepad size={32}/></div><h3>{games.length ? 'Nenhum jogo encontrado' : 'Sua biblioteca está esperando'}</h3><p>{games.length ? 'Tente mudar a busca ou remover alguns filtros.' : 'Adicione seu primeiro jogo e comece a montar sua coleção.'}</p><button className="btn primary" onClick={() => games.length ? clearFilters() : setModal({})}>{games.length ? 'Limpar filtros' : <><Plus size={16}/> Adicionar primeiro jogo</>}</button></div> : !error && <div className={view === 'grid' ? 'game-grid' : 'game-list'}>{filtered.map((game, index) => <article className={`game-card ${view === 'list' ? 'list-card' : ''}`} key={game.id}><div className="cover-wrap"><GameArt game={game} index={index}/><span className="cover-platform">{game.plataforma}</span><div className="card-actions"><button title="Editar jogo" onClick={() => setModal(game)}><Pencil size={15}/></button><button title="Excluir jogo" onClick={() => deleteGame(game)}><Trash2 size={15}/></button></div></div><div className="game-info"><div className="game-meta"><span>{game.plataforma}</span><span className="meta-dot"/><span><CalendarDays size={12}/> {date(game.data_lancamento)}</span></div><h3>{game.titulo}</h3><div className="game-bottom"><strong>{money(game.preco)}</strong><button onClick={() => setModal(game)} aria-label={`Editar ${game.titulo}`}><Pencil size={15}/> Editar</button></div></div></article>)}</div>}
      </section>
    </main>
    <footer><a className="brand footer-brand" href="#inicio"><span className="brand-mark"><Gamepad2 size={19}/></span><span>MUNDO<span className="brand-accent">DOS</span>JOGOS</span></a><span>Feito para quem vive o universo dos games.</span><span>© 2026 Mundo dos Jogos</span></footer>
    {modal && <Modal game={modal.id ? modal : null} onClose={() => setModal(null)} onSave={saveGame} saving={saving}/>}{toast && <div className="toast"><Sparkles size={16}/>{toast}</div>}
  </div>;
}
