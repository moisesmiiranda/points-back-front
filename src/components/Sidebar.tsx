import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarGroup {
  label: string;
  items: { label: string; path: string; icon: string }[];
}

const groups: SidebarGroup[] = [
  {
    label: 'Cadastros',
    items: [
      { label: 'Clientes', path: '/cadastros/clientes', icon: '👤' },
      { label: 'Estabelecimentos', path: '/cadastros/estabelecimentos', icon: '🏪' },
      { label: 'Compras', path: '/cadastros/compras', icon: '🛒' },
    ],
  },
  {
    label: 'Apagar',
    items: [
      { label: 'Clientes', path: '/apagar/clientes', icon: '🗑️' },
      { label: 'Estabelecimentos', path: '/apagar/estabelecimentos', icon: '🗑️' },
      { label: 'Compras', path: '/apagar/compras', icon: '🗑️' },
    ],
  },
  {
    label: 'Listagens',
    items: [
      { label: 'Clientes', path: '/listagens/clientes', icon: '📋' },
      { label: 'Estabelecimentos', path: '/listagens/estabelecimentos', icon: '📋' },
      { label: 'Compras', path: '/listagens/compras', icon: '📋' },
    ],
  },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Cadastros: true,
    Editar: true,
    Apagar: true,
    Listagens: true,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Points Manager</h1>
        <span>Painel de Controle</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-dashboard">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="icon">📊</span>
            Dashboard
          </NavLink>
        </div>

        {groups.map((group) => (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-title" onClick={() => toggleGroup(group.label)}>
              {group.label}
              <span className={`chevron ${openGroups[group.label] ? 'open' : ''}`}>▶</span>
            </div>
            <div className={`sidebar-group-items ${openGroups[group.label] ? 'open' : ''}`}>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
              {group.label === 'Cadastros' && auth.username === 'root' && (
                <NavLink
                  to="/cadastros/usuarios"
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <span className="icon">🧑‍💼</span>
                  Usuários
                </NavLink>
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Tema Claro' : '🌙 Tema Escuro'}
        </button>
      </div>
    </aside>
  );
}
