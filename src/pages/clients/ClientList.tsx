import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { useToast } from '../../components/Toast';
import type { ClientDto } from '../../types';

const PAGE_SIZE = 10;

interface Props {
  mode?: 'list' | 'edit' | 'delete';
}

export default function ClientList({ mode = 'list' }: Props) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await clientService.getAll();
      setClients(res.data);
    } catch {
      showToast('Erro ao carregar clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!filter) return clients;
    const lowerFilter = filter.toLowerCase();
    return clients.filter((c) =>
      c.name.toLowerCase().includes(lowerFilter) ||
      c.email.toLowerCase().includes(lowerFilter) ||
      c.phone.includes(filter) ||
      c.cpf.includes(filter)
    );
  }, [clients, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const titles: Record<string, { title: string; desc: string }> = {
    list: { title: 'Listagem de Clientes', desc: 'Visualize e pesquise todos os clientes cadastrados' },
    edit: { title: 'Editar Clientes', desc: 'Selecione um cliente para editar' },
    delete: { title: 'Apagar Clientes', desc: 'Funcionalidade de exclusão' },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-enter" style={{ marginRight: '280px' }}>
      <div className="page-header">
        <h2>{titles[mode].title}</h2>
        <p>{titles[mode].desc}</p>
      </div>

      {mode === 'delete' && (
        <div className="card notice-card">
          <div className="notice-icon">🚫</div>
          <h3>Endpoint Indisponível</h3>
          <p>
            O backend atual não expõe endpoints DELETE para clientes.
            Para habilitar esta funcionalidade, é necessário implementar
            <code> DELETE /clients/&#123;id&#125;</code> no controller do backend.
          </p>
        </div>
      )}

      {mode !== 'delete' && (
        <>
          <div className="search-panel card">
            <div className="search-panel-title">🔍 Buscar Clientes</div>
            <input
              className="form-input"
              style={{ width: '100%' }}
              placeholder="Pesquisar por nome, email, telefone ou CPF..."
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="icon">👤</div>
              <p>Nenhum cliente encontrado.</p>
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
                      <th>CPF</th>
                      <th>Pontos</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((c, i) => (
                      <tr key={c.id ?? i}>
                        <td>{c.id ?? '—'}</td>
                        <td>{c.name}</td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td>{c.cpf}</td>
                        <td>{c.points ?? 0}</td>
                        <td className="actions">
                          <button
                            className="btn btn-outline btn-sm"
                            disabled={c.id == null}
                            onClick={() => navigate(`/listagens/clientes/${c.id}`)}
                          >
                            🔎 Detalhes
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={c.id == null}
                            onClick={() => navigate(`/editar/clientes/${c.id}`)}
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
