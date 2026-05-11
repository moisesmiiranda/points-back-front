import { useState } from 'react';
import { clientService } from '../../services/clientService';
import { useToast } from '../../components/Toast';
import type { ClientDto } from '../../types';

export default function ClientCreate() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ClientDto>({ name: '', email: '', phone: '', cpf: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!form.email.trim()) errs.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    if (!form.phone.trim()) errs.phone = 'Telefone é obrigatório';
    else if (form.phone.replace(/\D/g, '').length < 11) errs.phone = 'Telefone deve ter no mínimo 11 dígitos';
    if (!form.cpf.trim()) errs.cpf = 'CPF é obrigatório';
    else if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(form.cpf)) errs.cpf = 'CPF inválido (ex: 123.456.789-00)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await clientService.create(form);
      showToast('Cliente criado com sucesso!', 'success');
      setForm({ name: '', email: '', phone: '', cpf: '' });
      setErrors({});
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao criar cliente';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ClientDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Cadastrar Cliente</h2>
        <p>Preencha os dados para criar um novo cliente</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              id="client-name"
              className="form-input"
              placeholder="Nome completo"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <div className="form-error">⚠ {errors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              id="client-email"
              className="form-input"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Telefone *</label>
            <input
              id="client-phone"
              className="form-input"
              placeholder="(00) 00000-0000"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            {errors.phone && <div className="form-error">⚠ {errors.phone}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">CPF *</label>
            <input
              id="client-cpf"
              className="form-input"
              placeholder="123.456.789-00"
              value={form.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
            />
            {errors.cpf && <div className="form-error">⚠ {errors.cpf}</div>}
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : '✓ Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
