import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { clientService } from '../../services/clientService';
import { establishmentService } from '../../services/establishmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import type { PurchaseDto, ClientDto, EstablishmentDto } from '../../types';

export default function PurchaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [purchase, setPurchase] = useState<PurchaseDto | null>(null);
  const [clientName, setClientName] = useState('');
  const [estName, setEstName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadData(parseInt(id));
  }, [id]);

  const loadData = async (purchaseId: number) => {
    setLoading(true);
    try {
      const [pRes, cRes, eRes] = await Promise.all([
        purchaseService.getById(purchaseId),
        clientService.getAll(),
        establishmentService.getAll(),
      ]);
      const p = pRes.data;
      setPurchase(p);
      const client = cRes.data.find((c: ClientDto) => c.id === p.clientId);
      setClientName(client?.name || `#${p.clientId}`);
      const est = eRes.data.find((e: EstablishmentDto) => e.id === p.establishmentId);
      setEstName(est?.name || `#${p.establishmentId}`);
    } catch {
      showToast('Compra não encontrada', 'error');
      navigate('/listagens/compras');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!purchase) return null;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Detalhes da Compra #{id}</h2>
        <p>Informações completas da compra</p>
      </div>

      <div className="card detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">ID</span>
            <span className="detail-value">{purchase.purchaseId ?? '—'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cliente</span>
            <span className="detail-value">{clientName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estabelecimento</span>
            <span className="detail-value">{estName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Valor (R$)</span>
            <span className="detail-value detail-points">
              R$ {parseFloat(String(purchase.amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/editar/compras/${purchase.purchaseId}`)}
          >
            ✏️ Editar Compra
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/listagens/compras')}
          >
            ← Voltar à Listagem
          </button>
        </div>
      </div>
    </div>
  );
}
