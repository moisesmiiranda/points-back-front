import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientCreate from './pages/clients/ClientCreate';
import ClientList from './pages/clients/ClientList';
import ClientEdit from './pages/clients/ClientEdit';
import ClientDetails from './pages/clients/ClientDetails';
import EstablishmentCreate from './pages/establishments/EstablishmentCreate';
import EstablishmentList from './pages/establishments/EstablishmentList';
import EstablishmentEdit from './pages/establishments/EstablishmentEdit';
import EstablishmentDetails from './pages/establishments/EstablishmentDetails';
import PurchaseCreate from './pages/purchases/PurchaseCreate';
import PurchaseList from './pages/purchases/PurchaseList';
import PurchaseEdit from './pages/purchases/PurchaseEdit';
import PurchaseDetails from './pages/purchases/PurchaseDetails';

function App() {
  function AppContent() {
    const auth = useAuth();
    const navigate = useNavigate();
    const hasSidebar = auth.isAuthenticated;

    return (
      <div className="app-layout">
        {hasSidebar && <Sidebar />}
        <main className={`main-content ${hasSidebar ? '' : 'no-sidebar'}`}>
          {hasSidebar && (
            <div className="page-topbar">
              <div className="page-topbar__spacer" />
              <div className="user-welcome">
                <div className="user-welcome__info">
                  <span className="user-avatar">👤</span>
                  <div>
                    <div className="user-welcome__text">Bem-vindo,</div>
                    <div className="user-name">{auth.username ?? 'Usuário'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="user-logout"
                  onClick={() => {
                    auth.logout();
                    navigate('/login');
                  }}
                >
                  <span className="logout-icon">←</span>
                  Sair
                </button>
              </div>
            </div>
          )}
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />

              {/* Cadastros */}
              <Route path="/cadastros/clientes" element={<ClientCreate />} />
              <Route path="/cadastros/estabelecimentos" element={<EstablishmentCreate />} />
              <Route path="/cadastros/compras" element={<PurchaseCreate />} />

              {/* Editar */}
              <Route path="/editar/clientes/:id" element={<ClientEdit />} />
              <Route path="/editar/estabelecimentos/:id" element={<EstablishmentEdit />} />
              <Route path="/editar/compras/:id" element={<PurchaseEdit />} />

              {/* Apagar */}
              <Route path="/apagar/clientes" element={<ClientList mode="delete" />} />
              <Route path="/apagar/estabelecimentos" element={<EstablishmentList mode="delete" />} />
              <Route path="/apagar/compras" element={<PurchaseList mode="delete" />} />

              {/* Listagens */}
              <Route path="/listagens/clientes" element={<ClientList mode="list" />} />
              <Route path="/listagens/clientes/:id" element={<ClientDetails />} />
              <Route path="/listagens/estabelecimentos" element={<EstablishmentList mode="list" />} />
              <Route path="/listagens/estabelecimentos/:id" element={<EstablishmentDetails />} />
              <Route path="/listagens/compras" element={<PurchaseList mode="list" />} />
              <Route path="/listagens/compras/:id" element={<PurchaseDetails />} />
            </Route>
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
