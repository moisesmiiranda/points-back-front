import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { clientService } from '../../services/clientService';
import { establishmentService } from '../../services/establishmentService';
import { useToast } from '../../components/Toast';
import type { PurchaseDto, ClientDto, EstablishmentDto } from '../../types';

export default function PurchaseCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentDto[]>([]);
  const [form, setForm] = useState<PurchaseDto>({ clientId: 0, establishmentId: 0, amount: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [clientSearchText, setClientSearchText] = useState('');
  const [appliedClientFilter, setAppliedClientFilter] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);

  const [establishmentSearchText, setEstablishmentSearchText] = useState('');
  const [appliedEstablishmentFilter, setAppliedEstablishmentFilter] = useState('');
  const [showEstablishmentResults, setShowEstablishmentResults] = useState(false);

  const filteredClients = useMemo(() => {
    if (!appliedClientFilter) return clients;
    const lowerFilter = appliedClientFilter.toLowerCase();
    return clients.filter((c) =>
      c.name.toLowerCase().includes(lowerFilter) ||
      c.email.toLowerCase().includes(lowerFilter) ||
      c.phone.includes(appliedClientFilter) ||
      c.cpf.includes(appliedClientFilter)
    );
  }, [clients, appliedClientFilter]);

  const filteredEstablishments = useMemo(() => {
    if (!appliedEstablishmentFilter) return establishments;
    const lowerFilter = appliedEstablishmentFilter.toLowerCase();
    return establishments.filter((e) =>
      e.name.toLowerCase().includes(lowerFilter) ||
      e.email.toLowerCase().includes(lowerFilter) ||
      e.phone.includes(appliedEstablishmentFilter) ||
      e.cnpj.includes(appliedEstablishmentFilter)
    );
  }, [establishments, appliedEstablishmentFilter]);

  const handleSearchClient = () => {
    setAppliedClientFilter(clientSearchText);
    setShowClientResults(true);
  };

  const handleSearchEstablishment = () => {
    setAppliedEstablishmentFilter(establishmentSearchText);
    setShowEstablishmentResults(true);
  };

  const handleCancel = () => {
    setForm({ clientId: 0, establishmentId: 0, amount: '' });
    setClientSearchText('');
    setAppliedClientFilter('');
    setShowClientResults(false);
    setEstablishmentSearchText('');
    setAppliedEstablishmentFilter('');
    setShowEstablishmentResults(false);
    setErrors({});
  };

  useEffect(() => {
    Promise.all([clientService.getAll(), establishmentService.getAll()])
      .then(([cRes, eRes]) => {
        setClients(cRes.data);
        setEstablishments(eRes.data);
      })
      .catch(() => showToast('Erro ao carregar dados auxiliares', 'error'));
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.clientId) errs.clientId = 'Selecione um cliente';
    if (!form.establishmentId) errs.establishmentId = 'Selecione um estabelecimento';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Valor deve ser > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await purchaseService.create(form);
      showToast('Compra registrada com sucesso! Pontos do cliente foram atualizados.', 'success');
      setForm({ clientId: 0, establishmentId: 0, amount: '' });
      setErrors({});
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erro ao registrar compra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Registrar Compra</h2>
        <p>Registre uma nova compra. Os pontos do cliente serão atualizados automaticamente.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Digite o nome, email, telefone ou CPF do cliente..."
                value={clientSearchText}
                onChange={(e) => setClientSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchClient(); } }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSearchClient}
              >
                🔍 Buscar
              </button>
            </div>

            {showClientResults && (
              <div className="table-container" style={{ marginBottom: '16px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>CPF</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                          Nenhum cliente encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((c) => (
                        <tr key={c.id}>
                          <td>{c.id ?? '—'}</td>
                          <td>{c.name}</td>
                          <td>{c.email}</td>
                          <td>{c.phone}</td>
                          <td>{c.cpf}</td>
                          <td className="actions">
                            <button
                              type="button"
                              className={`btn ${form.clientId === c.id ? 'btn-success' : 'btn-primary'} btn-sm`}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, clientId: c.id || 0 }));
                                if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: '' }));
                                setShowClientResults(false);
                              }}
                            >
                              {form.clientId === c.id ? '✓ Selecionado' : 'Selecionar'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {form.clientId !== 0 && (
              <div style={{ padding: '8px', backgroundColor: 'rgba(108, 92, 231, 0.15)', border: '1px solid var(--accent-primary)', borderRadius: '4px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                ✓ Cliente Selecionado: <strong>{clients.find(c => c.id === form.clientId)?.name}</strong>
              </div>
            )}

            {errors.clientId && <div className="form-error">⚠ {errors.clientId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Estabelecimento *</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Digite o nome, email, telefone ou CNPJ do estabelecimento..."
                value={establishmentSearchText}
                onChange={(e) => setEstablishmentSearchText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchEstablishment(); } }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSearchEstablishment}
              >
                🔍 Buscar
              </button>
            </div>

            {showEstablishmentResults && (
              <div className="table-container" style={{ marginBottom: '16px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>CNPJ</th>
                      <th>R$/Ponto</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEstablishments.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                          Nenhum estabelecimento encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredEstablishments.map((e) => (
                        <tr key={e.id}>
                          <td>{e.id ?? '—'}</td>
                          <td>{e.name}</td>
                          <td>{e.email}</td>
                          <td>{e.phone}</td>
                          <td>{e.cnpj}</td>
                          <td>{e.valuePerPoint ?? '—'}</td>
                          <td className="actions">
                            <button
                              type="button"
                              className={`btn ${form.establishmentId === e.id ? 'btn-success' : 'btn-primary'} btn-sm`}
                              onClick={() => {
                                setForm((prev) => ({ ...prev, establishmentId: e.id || 0 }));
                                if (errors.establishmentId) setErrors((prev) => ({ ...prev, establishmentId: '' }));
                                setShowEstablishmentResults(false);
                              }}
                            >
                              {form.establishmentId === e.id ? '✓ Selecionado' : 'Selecionar'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {form.establishmentId !== 0 && (
              <div style={{ padding: '8px', backgroundColor: 'rgba(108, 92, 231, 0.15)', border: '1px solid var(--accent-primary)', borderRadius: '4px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                ✓ Estabelecimento Selecionado: <strong>{establishments.find(e => e.id === form.establishmentId)?.name}</strong>
              </div>
            )}

            {errors.establishmentId && <div className="form-error">⚠ {errors.establishmentId}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Valor (R$) *</label>
            <input
              id="purchase-amount"
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="100.00"
              value={form.amount}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, amount: e.target.value }));
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
              }}
            />
            {errors.amount && <div className="form-error">⚠ {errors.amount}</div>}
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registrando...' : '✓ Registrar Compra'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleCancel}
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
      </div>
    </div>
  );
}
