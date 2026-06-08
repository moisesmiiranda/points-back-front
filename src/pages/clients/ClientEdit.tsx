import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import type { ClientDto } from '../../types';

export default function ClientEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState<ClientDto | null>(null);
  const [form, setForm] = useState<ClientDto>({ name: '', email: '', phone: '', cpf: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add Points
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [addingPoints, setAddingPoints] = useState(false);

  useEffect(() => {
    if (id) loadClient(parseInt(id));
  }, [id]);

  const loadClient = async (clientId: number) => {
    setLoading(true);
    try {
      const res = await clientService.getById(clientId);
      setOriginal(res.data);
      setForm(res.data);
    } catch {
      showToast('Cliente não encontrado', 'error');
      navigate('/listagens/clientes');
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
    else if (form.phone.replace(/\D/g, '').length < 11) errs.phone = 'Telefone deve ter no mínimo 11 dígitos';
    if (!form.cpf.trim()) errs.cpf = 'CPF é obrigatório';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    // Build partial payload: only changed fields
    const payload: Partial<ClientDto> = {};
    if (original) {
      if (form.name !== original.name) payload.name = form.name;
      if (form.email !== original.email) payload.email = form.email;
      if (form.phone !== original.phone) payload.phone = form.phone;
      if (form.cpf !== original.cpf) payload.cpf = form.cpf;
    }

    if (Object.keys(payload).length === 0) {
      showToast('Nenhuma alteração detectada', 'error');
      return;
    }

    setSaving(true);
    try {
      await clientService.update(parseInt(id), payload);
      showToast('Cliente atualizado com sucesso!', 'success');
      setOriginal({ ...form });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao atualizar cliente';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPoints = async () => {
    const pts = parseInt(pointsToAdd);
    if (!pts || pts <= 0 || !id) {
      showToast('Informe um valor de pontos > 0', 'error');
      return;
    }
    setAddingPoints(true);
    try {
      await clientService.addPoints(parseInt(id), pts);
      showToast(`${pts} pontos adicionados com sucesso!`, 'success');
      setPointsToAdd('');
      loadClient(parseInt(id));
    } catch {
      showToast('Erro ao adicionar pontos', 'error');
    } finally {
      setAddingPoints(false);
    }
  };

  const handleChange = (field: keyof ClientDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Editar Cliente #{id}</h2>
        <p>Altere os dados do cliente. Apenas campos modificados serão enviados.</p>
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
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                className="form-input"
                type="email"
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
                className="form-input"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {errors.phone && <div className="form-error">⚠ {errors.phone}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">CPF *</label>
              <input
                className="form-input"
                value={form.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
              />
              {errors.cpf && <div className="form-error">⚠ {errors.cpf}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pontos Atuais</label>
            <input className="form-input" value={form.points ?? 0} disabled />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : '✓ Salvar'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/listagens/clientes')}
            >
              ✗ Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={() => navigate('/')}
            >
              🚪 Sair
            </button>
          </div>
        </form>

        <div className="add-points-section">
          <h3>⭐ Adicionar Pontos</h3>
          <div className="add-points-row">
            <div className="form-group">
              <label className="form-label">Pontos</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="10"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={handleAddPoints}
              disabled={addingPoints}
            >
              {addingPoints ? 'Adicionando...' : '+ Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
