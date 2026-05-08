import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { clientService } from '../../services/clientService';
import { establishmentService } from '../../services/establishmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import type { PurchaseDto, ClientDto, EstablishmentDto } from '../../types';

export default function PurchaseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState<PurchaseDto | null>(null);
  const [form, setForm] = useState<PurchaseDto>({ clientId: 0, establishmentId: 0, amount: '' });
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      setOriginal(pRes.data);
      setForm(pRes.data);
      setClients(cRes.data);
      setEstablishments(eRes.data);
    } catch {
      showToast('Compra não encontrada', 'error');
      navigate('/editar/compras');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.clientId) errs.clientId = 'Selecione um cliente';
    if (!form.establishmentId) errs.establishmentId = 'Selecione um estabelecimento';
    if (!form.amount || parseFloat(String(form.amount)) <= 0) errs.amount = 'Valor deve ser > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    const payload: Partial<PurchaseDto> = {};
    if (original) {
      if (form.clientId !== original.clientId) payload.clientId = form.clientId;
      if (form.establishmentId !== original.establishmentId) payload.establishmentId = form.establishmentId;
      if (String(form.amount) !== String(original.amount)) payload.amount = form.amount;
    }

    if (Object.keys(payload).length === 0) {
      showToast('Nenhuma alteração detectada', 'error');
      return;
    }

    setSaving(true);
    try {
      await purchaseService.update(parseInt(id), payload);
      showToast('Compra atualizada com sucesso!', 'success');
      setOriginal({ ...form });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erro ao atualizar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Editar Compra #{id}</h2>
        <p>Altere os dados da compra. Apenas campos modificados serão enviados.</p>
      </div>

      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ID da Compra</label>
            <input className="form-input" value={id} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select
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
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, amount: e.target.value }));
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
            />
            {errors.amount && <div className="form-error">⚠ {errors.amount}</div>}
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : '✓ Salvar Alterações'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/editar/compras')}>
              ← Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
