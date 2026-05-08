import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { establishmentService } from '../../services/establishmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import type { EstablishmentDto } from '../../types';

const PAGE_SIZE = 10;

interface Props {
  mode?: 'list' | 'edit' | 'delete';
}

export default function EstablishmentList({ mode = 'list' }: Props) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<EstablishmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filter, setFilter] = useState('');
  const [searchId, setSearchId] = useState('');

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await establishmentService.getAll();
      setItems(res.data);
    } catch {
      showToast('Erro ao carregar estabelecimentos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchById = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    try {
      const res = await establishmentService.getById(parseInt(searchId));
      setItems([res.data]);
      setPage(1);
    } catch {
      showToast('Estabelecimento não encontrado', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!filter) return items;
    const lowerFilter = filter.toLowerCase();
    return items.filter((e) =>
      e.name.toLowerCase().includes(lowerFilter) ||
      e.email.toLowerCase().includes(lowerFilter) ||
      e.phone.includes(filter) ||
      e.cnpj.includes(filter)
    );
  }, [items, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const titles: Record<string, { title: string; desc: string }> = {
    list: { title: 'Listagem de Estabelecimentos', desc: 'Visualize e pesquise estabelecimentos' },
    edit: { title: 'Editar Estabelecimentos', desc: 'Selecione um estabelecimento para editar' },
    delete: { title: 'Apagar Estabelecimentos', desc: 'Funcionalidade de exclusão' },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>{titles[mode].title}</h2>
        <p>{titles[mode].desc}</p>
      </div>

      {mode === 'delete' && (
        <div className="card notice-card">
          <div className="notice-icon">🚫</div>
          <h3>Endpoint Indisponível</h3>
          <p>
            O backend atual não expõe endpoints DELETE para estabelecimentos.
            Para habilitar, implemente <code>DELETE /establishments/&#123;id&#125;</code> no backend.
          </p>
        </div>
      )}

      {mode !== 'delete' && (
        <>
          <div className="id-search">
            <div className="form-group">
              <label className="form-label">Buscar por ID</label>
              <input className="form-input" placeholder="ID" type="number" value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchById()} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleSearchById}>🔍 Buscar</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearchId(''); loadItems(); }}>Limpar</button>
          </div>

          <div className="filters-bar" style={{ display: 'block' }}>
            <label className="form-label">Filtrar por nome, email, telefone ou CNPJ</label>
            <input
              className="form-input"
              style={{ width: '100%', maxWidth: '100%' }}
              placeholder="Digite o nome, email, telefone ou CNPJ do estabelecimento..."
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="icon">🏪</div>
              <p>Nenhum estabelecimento encontrado.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>CNPJ</th>
                      <th>R$/Ponto</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((e, i) => (
                      <tr key={e.id ?? i}>
                        <td>{e.id ?? '—'}</td>
                        <td>{e.name}</td>
                        <td>{e.email}</td>
                        <td>{e.phone}</td>
                        <td>{e.cnpj}</td>
                        <td>{e.valuePerPoint ?? '—'}</td>
                        <td className="actions">
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={e.id == null}
                            onClick={() => navigate(`/editar/estabelecimentos/${e.id}`)}
                          >
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
