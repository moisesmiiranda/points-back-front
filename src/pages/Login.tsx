import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedLogin = localStorage.getItem('remembered_login');
    if (storedLogin) {
      setUsername(storedLogin);
      setRememberMe(true);
    }
  }, []);

  const canSubmit = username.trim() !== '' && password !== '' && !loading;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('remembered_login', username.trim());
      } else {
        localStorage.removeItem('remembered_login');
      }
      await auth.login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Erro na autenticação';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form card" onSubmit={onSubmit}>
        <h2>Entrar</h2>

        {error && <div className="error">{error}</div>}

        <label className="form-group">
          <div className="form-label">Usuário</div>
          <input
            className="form-input"
            placeholder="login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            disabled={loading}
          />
        </label>

        <label className="form-group">
          <div className="form-label">Senha</div>
          <div className="password-field">
            <input
              className="form-input"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="btn btn-secondary show-pw">
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </label>

        <div className="login-options">
          <label className="remember-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            Lembrar senha
          </label>
          <div className="login-links">
            <Link to="/forgot" className="login-forgot-link">
              Esqueci a senha
            </Link>
          </div>
        </div>

        <button type="submit" disabled={!canSubmit} className="btn-primary login-submit">
          {loading ? 'Entrando...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
