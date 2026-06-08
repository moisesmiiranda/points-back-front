import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { establishmentService } from '../../services/establishmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import type { EstablishmentDto } from '../../types';

export default function EstablishmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [item, setItem] = useState<EstablishmentDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadItem(parseInt(id));
  }, [id]);

  const loadItem = async (itemId: number) => {
    setLoading(true);
    try {
      const res = await establishmentService.getById(itemId);
      setItem(res.data);
    } catch {
      showToast('Estabelecimento não encontrado', 'error');
      navigate('/listagens/estabelecimentos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!item) return null;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Detalhes do Estabelecimento #{id}</h2>
        <p>Informações completas do estabelecimento</p>
      </div>

      <div className="card detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">ID</span>
            <span className="detail-value">{item.id ?? '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Nome</span>
            <span className="detail-value">{item.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span className="detail-value">{item.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Telefone</span>
            <span className="detail-value">{item.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">CNPJ</span>
            <span className="detail-value">{item.cnpj}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Valor por Ponto (R$)</span>
            <span className="detail-value">{item.valuePerPoint ?? '—'}</span>
          </div>
        </div>

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/editar/estabelecimentos/${item.id}`)}
          >
            ✏️ Editar Estabelecimento
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/listagens/estabelecimentos')}
          >
            ← Voltar à Listagem
          </button>
        </div>
      </div>
    </div>
  );
}
