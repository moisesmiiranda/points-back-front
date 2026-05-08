import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { clientService } from '../../services/clientService';
import { establishmentService } from '../../services/establishmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import type { PurchaseDto, ClientDto, EstablishmentDto } from '../../types';

const PAGE_SIZE = 10;

interface Props {
  mode?: 'list' | 'edit' | 'delete';
}

export default function PurchaseList({ mode = 'list' }: Props) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<PurchaseDto[]>([]);
  const [clients, setClients] = useState<Map<number, string>>(new Map());
  const [establishments, setEstablishments] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filter, setFilter] = useState('');
  const [searchId, setSearchId] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, eRes] = await Promise.all([
        purchaseService.getAll(),
        clientService.getAll(),
        establishmentService.getAll(),
      ]);
      setItems(pRes.data);
      const cMap = new Map<number, string>();
      cRes.data.forEach((c: ClientDto) => { if (c.id) cMap.set(c.id, c.name); });
      setClients(cMap);
      const eMap = new Map<number, string>();
      eRes.data.forEach((e: EstablishmentDto) => { if (e.id) eMap.set(e.id, e.name); });
      setEstablishments(eMap);
    } catch {
      showToast('Erro ao carregar compras', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchById = async () => {
    if (!searchId.trim()) return;
    setLoading(true);
    try {
      const res = await purchaseService.getById(parseInt(searchId));
      setItems([res.data]);
      setPage(1);
    } catch {
      showToast('Compra não encontrada', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!filter) return items;
    const lowerFilter = filter.toLowerCase();
    return items.filter((p) => {
      const clientName = (clients.get(p.clientId) || '').toLowerCase();
      const estName = (establishments.get(p.establishmentId) || '').toLowerCase();
      return clientName.includes(lowerFilter) || estName.includes(lowerFilter);
    });
  }, [items, filter, clients, establishments]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const titles: Record<string, { title: string; desc: string }> = {
    list: { title: 'Listagem de Compras', desc: 'Visualize e pesquise todas as compras' },
    edit: { title: 'Editar Compras', desc: 'Selecione uma compra para editar' },
    delete: { title: 'Apagar Compras', desc: 'Funcionalidade de exclusão' },
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
            O backend atual não expõe endpoints DELETE para compras.
            Para habilitar, implemente <code>DELETE /purchases/&#123;id&#125;</code> no backend.
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
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearchId(''); loadData(); }}>Limpar</button>
          </div>

          <div className="filters-bar" style={{ display: 'block' }}>
            <label className="form-label">Filtrar por nome do cliente ou estabelecimento</label>
            <input
              className="form-input"
              style={{ width: '100%', maxWidth: '100%' }}
              placeholder="Digite o nome do cliente ou do estabelecimento..."
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="icon">🛒</div>
              <p>Nenhuma compra encontrada.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Estabelecimento</th>
                      <th>Valor (R$)</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((p, i) => (
                      <tr key={p.purchaseId ?? i}>
                        <td>{p.purchaseId ?? '—'}</td>
                        <td>{clients.get(p.clientId) || `#${p.clientId}`}</td>
                        <td>{establishments.get(p.establishmentId) || `#${p.establishmentId}`}</td>
                        <td>R$ {parseFloat(String(p.amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="actions">
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={p.purchaseId == null}
                            onClick={() => navigate(`/editar/compras/${p.purchaseId}`)}
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
