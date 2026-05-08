import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import ClientCreate from './pages/clients/ClientCreate';
import ClientList from './pages/clients/ClientList';
import ClientEdit from './pages/clients/ClientEdit';
import EstablishmentCreate from './pages/establishments/EstablishmentCreate';
import EstablishmentList from './pages/establishments/EstablishmentList';
import EstablishmentEdit from './pages/establishments/EstablishmentEdit';
import PurchaseCreate from './pages/purchases/PurchaseCreate';
import PurchaseList from './pages/purchases/PurchaseList';
import PurchaseEdit from './pages/purchases/PurchaseEdit';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* Cadastros */}
              <Route path="/cadastros/clientes" element={<ClientCreate />} />
              <Route path="/cadastros/estabelecimentos" element={<EstablishmentCreate />} />
              <Route path="/cadastros/compras" element={<PurchaseCreate />} />

              {/* Editar */}
              <Route path="/editar/clientes" element={<ClientList mode="edit" />} />
              <Route path="/editar/clientes/:id" element={<ClientEdit />} />
              <Route path="/editar/estabelecimentos" element={<EstablishmentList mode="edit" />} />
              <Route path="/editar/estabelecimentos/:id" element={<EstablishmentEdit />} />
              <Route path="/editar/compras" element={<PurchaseList mode="edit" />} />
              <Route path="/editar/compras/:id" element={<PurchaseEdit />} />

              {/* Apagar */}
              <Route path="/apagar/clientes" element={<ClientList mode="delete" />} />
              <Route path="/apagar/estabelecimentos" element={<EstablishmentList mode="delete" />} />
              <Route path="/apagar/compras" element={<PurchaseList mode="delete" />} />

              {/* Listagens */}
              <Route path="/listagens/clientes" element={<ClientList mode="list" />} />
              <Route path="/listagens/estabelecimentos" element={<EstablishmentList mode="list" />} />
              <Route path="/listagens/compras" element={<PurchaseList mode="list" />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
