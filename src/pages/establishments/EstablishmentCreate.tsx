import { useState } from 'react';
import { establishmentService } from '../../services/establishmentService';
import { useToast } from '../../components/Toast';
import type { EstablishmentDto } from '../../types';

export default function EstablishmentCreate() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EstablishmentDto>({
    name: '', email: '', phone: '', cnpj: '', valuePerPoint: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!form.email.trim()) errs.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    if (!form.phone.trim()) errs.phone = 'Telefone é obrigatório';
    if (!form.cnpj.trim()) errs.cnpj = 'CNPJ é obrigatório';
    else if (!/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(form.cnpj))
      errs.cnpj = 'CNPJ inválido (ex: 12.345.678/0001-90)';
    if (form.valuePerPoint !== undefined && form.valuePerPoint <= 0)
      errs.valuePerPoint = 'Valor por ponto deve ser > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await establishmentService.create(form);
      showToast('Estabelecimento criado com sucesso!', 'success');
      setForm({ name: '', email: '', phone: '', cnpj: '', valuePerPoint: undefined });
      setErrors({});
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erro ao criar estabelecimento', 'error');
    } finally {
      setLoading(false);
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

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Cadastrar Estabelecimento</h2>
        <p>Preencha os dados para criar um novo estabelecimento</p>
      </div>

      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input
                id="est-name"
                className="form-input"
                placeholder="Nome do estabelecimento"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                id="est-email"
                className="form-input"
                type="email"
                placeholder="contato@empresa.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && <div className="form-error">⚠ {errors.email}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefone *</label>
              <input
                id="est-phone"
                className="form-input"
                placeholder="(00) 0000-0000"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {errors.phone && <div className="form-error">⚠ {errors.phone}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">CNPJ *</label>
              <input
                id="est-cnpj"
                className="form-input"
                placeholder="12.345.678/0001-90"
                value={form.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
              />
              {errors.cnpj && <div className="form-error">⚠ {errors.cnpj}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Valor por Ponto (R$)</label>
            <input
              id="est-valuePerPoint"
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="1.00"
              value={form.valuePerPoint ?? ''}
              onChange={(e) => handleChange('valuePerPoint', e.target.value)}
            />
            {errors.valuePerPoint && <div className="form-error">⚠ {errors.valuePerPoint}</div>}
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : '✓ Cadastrar Estabelecimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
