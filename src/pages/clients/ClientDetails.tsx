import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import type { ClientDto } from '../../types';

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [client, setClient] = useState<ClientDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadClient(parseInt(id));
  }, [id]);

  const loadClient = async (clientId: number) => {
    setLoading(true);
    try {
      const res = await clientService.getById(clientId);
      setClient(res.data);
    } catch {
      showToast('Cliente não encontrado', 'error');
      navigate('/listagens/clientes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!client) return null;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Detalhes do Cliente #{id}</h2>
        <p>Informações completas do cliente</p>
      </div>

      <div className="card detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">ID</span>
            <span className="detail-value">{client.id ?? '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Nome</span>
            <span className="detail-value">{client.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{client.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Telefone</span>
            <span className="detail-value">{client.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CPF</span>
            <span className="detail-value">{client.cpf}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Pontos</span>
            <span className="detail-value detail-points">⭐ {client.points ?? 0}</span>
          </div>
        </div>

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/editar/clientes/${client.id}`)}
          >
            ✏️ Editar Cliente
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/listagens/clientes')}
          >
            ← Voltar à Listagem
          </button>
        </div>
      </div>
    </div>
  );
}
