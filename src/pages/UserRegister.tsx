import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import type { UserAccountDto } from '../types';

const initialForm: UserAccountDto = {
  username: '',
  password: '',
  name: '',
  cpf: '',
  phone: '',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  cep: '',
  email: '',
  birthDate: '',
  permissions: [],
};

export default function UserRegister() {
  const auth = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState<UserAccountDto>(initialForm);
  const [permissionsText, setPermissionsText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (auth.username !== 'root') {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!form.cpf.trim()) errs.cpf = 'CPF é obrigatório';
    else {
      const cleanCpf = form.cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) errs.cpf = 'CPF inválido (ex: 123.456.789-00)';
    }
    if (!form.username.trim()) errs.username = 'Login é obrigatório';
    if (!form.password.trim()) errs.password = 'Senha é obrigatória';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: keyof UserAccountDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        permissions: permissionsText
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean),
      };
      await authService.register(payload);
      showToast('Usuário criado com sucesso!', 'success');
      setForm(initialForm);
      setPermissionsText('');
      setErrors({});
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao cadastrar usuário';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ marginRight: '280px' }}>
      <div className="page-header">
        <h2>Cadastrar Usuário</h2>
        <p>Somente o root pode criar novas contas de usuário.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input
              className="form-input"
              placeholder="Nome completo"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <div className="form-error">⚠ {errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">CPF *</label>
            <input
              className="form-input"
              placeholder="123.456.789-00"
              value={form.cpf}
              onChange={(e) => handleChange('cpf', e.target.value)}
            />
            {errors.cpf && <div className="form-error">⚠ {errors.cpf}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Login *</label>
            <input
              className="form-input"
              placeholder="login do usuário"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
            {errors.username && <div className="form-error">⚠ {errors.username}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Senha *</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input
              className="form-input"
              placeholder="(00) 00000-0000"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="email@exemplo.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Data de nascimento</label>
            <input
              className="form-input"
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">CEP</label>
            <input
              className="form-input"
              placeholder="00000-000"
              value={form.cep}
              onChange={(e) => handleChange('cep', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rua</label>
            <input
              className="form-input"
              placeholder="Rua"
              value={form.street}
              onChange={(e) => handleChange('street', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Número</label>
            <input
              className="form-input"
              placeholder="Número"
              value={form.number}
              onChange={(e) => handleChange('number', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bairro</label>
            <input
              className="form-input"
              placeholder="Bairro"
              value={form.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input
              className="form-input"
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Permissões</label>
            <input
              className="form-input"
              placeholder="CLIENT_GET, CLIENT_POST"
              value={permissionsText}
              onChange={(e) => setPermissionsText(e.target.value)}
            />
            <div className="form-help">Separe permissões por vírgula, ex: CLIENT_GET, ESTABLISHMENT_GET</div>
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
