import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { establishmentService } from '../../services/establishmentService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import type { EstablishmentDto } from '../../types';

export default function EstablishmentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState<EstablishmentDto | null>(null);
  const [form, setForm] = useState<EstablishmentDto>({
    name: '', email: '', phone: '', cnpj: '', valuePerPoint: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) loadItem(parseInt(id));
  }, [id]);

  const loadItem = async (itemId: number) => {
    setLoading(true);
    try {
      const res = await establishmentService.getById(itemId);
      setOriginal(res.data);
      setForm(res.data);
    } catch {
      showToast('Estabelecimento não encontrado', 'error');
      navigate('/editar/estabelecimentos');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!form.email.trim()) errs.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    if (!form.phone.trim()) errs.phone = 'Telefone é obrigatório';
    if (!form.cnpj.trim()) errs.cnpj = 'CNPJ é obrigatório';
    if (form.valuePerPoint !== undefined && form.valuePerPoint <= 0)
      errs.valuePerPoint = 'Valor por ponto deve ser > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    const payload: Partial<EstablishmentDto> = {};
    if (original) {
      if (form.name !== original.name) payload.name = form.name;
      if (form.email !== original.email) payload.email = form.email;
      if (form.phone !== original.phone) payload.phone = form.phone;
      if (form.cnpj !== original.cnpj) payload.cnpj = form.cnpj;
      if (form.valuePerPoint !== original.valuePerPoint) payload.valuePerPoint = form.valuePerPoint;
    }

    if (Object.keys(payload).length === 0) {
      showToast('Nenhuma alteração detectada', 'error');
      return;
    }

    setSaving(true);
    try {
      await establishmentService.update(parseInt(id), payload);
      showToast('Estabelecimento atualizado com sucesso!', 'success');
      setOriginal({ ...form });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erro ao atualizar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof EstablishmentDto, value: string) => {
    if (field === 'valuePerPoint') {
      setForm((prev) => ({ ...prev, [field]: value ? parseFloat(value) : undefined }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Editar Estabelecimento #{id}</h2>
        <p>Altere os dados. Apenas campos modificados serão enviados.</p>
      </div>

      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ID</label>
            <input className="form-input" value={id} disabled />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-input" value={form.name}
                onChange={(e) => handleChange('name', e.target.value)} />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email}
                onChange={(e) => handleChange('email', e.target.value)} />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefone *</label>
              <input className="form-input" value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)} />
              {errors.phone && <div className="form-error">⚠ {errors.phone}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">CNPJ *</label>
              <input className="form-input" value={form.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)} />
              {errors.cnpj && <div className="form-error">⚠ {errors.cnpj}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Valor por Ponto (R$)</label>
            <input className="form-input" type="number" step="0.01" min="0.01"
              value={form.valuePerPoint ?? ''}
              onChange={(e) => handleChange('valuePerPoint', e.target.value)} />
            {errors.valuePerPoint && <div className="form-error">⚠ {errors.valuePerPoint}</div>}
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : '✓ Salvar Alterações'}
            </button>
            <button type="button" className="btn btn-secondary"
              onClick={() => navigate('/editar/estabelecimentos')}>← Voltar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
