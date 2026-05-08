import { useState, useEffect } from 'react';
import { purchaseService } from '../../services/purchaseService';
import { clientService } from '../../services/clientService';
import { establishmentService } from '../../services/establishmentService';
import { useToast } from '../../components/Toast';
import type { PurchaseDto, ClientDto, EstablishmentDto } from '../../types';

export default function PurchaseCreate() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentDto[]>([]);
  const [form, setForm] = useState<PurchaseDto>({ clientId: 0, establishmentId: 0, amount: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([clientService.getAll(), establishmentService.getAll()])
      .then(([cRes, eRes]) => {
        setClients(cRes.data);
        setEstablishments(eRes.data);
      })
      .catch(() => showToast('Erro ao carregar dados auxiliares', 'error'));
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.clientId) errs.clientId = 'Selecione um cliente';
    if (!form.establishmentId) errs.establishmentId = 'Selecione um estabelecimento';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Valor deve ser > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await purchaseService.create(form);
      showToast('Compra registrada com sucesso! Pontos do cliente foram atualizados.', 'success');
      setForm({ clientId: 0, establishmentId: 0, amount: '' });
      setErrors({});
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erro ao registrar compra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Registrar Compra</h2>
        <p>Registre uma nova compra. Os pontos do cliente serão atualizados automaticamente.</p>
      </div>

      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select
              id="purchase-client"
              className="form-select"
              value={form.clientId}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, clientId: parseInt(e.target.value) || 0 }));
                if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: '' }));
              }}
            >
              <option value={0}>Selecione um cliente...</option>
              {clients.map((c, i) => (
                <option key={c.id ?? `c-${i}`} value={c.id}>
                  {c.name} — CPF: {c.cpf}
                </option>
              ))}
            </select>
            {errors.clientId && <div className="form-error">⚠ {errors.clientId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Estabelecimento *</label>
            <select
              id="purchase-establishment"
              className="form-select"
              value={form.establishmentId}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, establishmentId: parseInt(e.target.value) || 0 }));
                if (errors.establishmentId) setErrors((prev) => ({ ...prev, establishmentId: '' }));
              }}
            >
              <option value={0}>Selecione um estabelecimento...</option>
              {establishments.map((e, i) => (
                <option key={e.id ?? `e-${i}`} value={e.id}>
                  {e.name} — CNPJ: {e.cnpj}
                </option>
              ))}
            </select>
            {errors.establishmentId && <div className="form-error">⚠ {errors.establishmentId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Valor (R$) *</label>
            <input
              id="purchase-amount"
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="100.00"
              value={form.amount}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, amount: e.target.value }));
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
            />
            {errors.amount && <div className="form-error">⚠ {errors.amount}</div>}
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : '✓ Registrar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
