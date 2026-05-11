import { useState, useEffect, useMemo } from 'react';
import { purchaseService } from '../../services/purchaseService';
import { clientService } from '../../services/clientService';
import { establishmentService } from '../../services/establishmentService';
import { useToast } from '../../components/Toast';
import type { PurchaseDto, ClientDto, EstablishmentDto } from '../../types';

export default function PurchaseCreate() {
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

      <div className="card form-container">
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
                className="btn btn-secondary"
                onClick={handleSearchClient}
              >
                Pesquisar cliente
              </button>
            </div>
            
            {showClientResults && (
              <div style={{ border: '1px solid #ddd', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', marginBottom: '8px' }}>
                {filteredClients.length === 0 ? (
                  <div style={{ padding: '8px', color: '#666' }}>Nenhum cliente encontrado.</div>
                ) : (
                  filteredClients.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, clientId: c.id || 0 }));
                        if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: '' }));
                        setShowClientResults(false);
                      }}
                      style={{
                        padding: '8px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        backgroundColor: form.clientId === c.id ? '#e6f7ff' : '#fff',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = form.clientId === c.id ? '#e6f7ff' : '#fff'}
                    >
                      {c.name} — CPF: {c.cpf}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {form.clientId !== 0 && (
              <div style={{ padding: '8px', backgroundColor: '#e6f7ff', border: '1px solid #1890ff', borderRadius: '4px', marginBottom: '8px', color: '#0050b3' }}>
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
                className="btn btn-secondary"
                onClick={handleSearchEstablishment}
              >
                Pesquisar estabelecimento
              </button>
            </div>
            
            {showEstablishmentResults && (
              <div style={{ border: '1px solid #ddd', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto', marginBottom: '8px' }}>
                {filteredEstablishments.length === 0 ? (
                  <div style={{ padding: '8px', color: '#666' }}>Nenhum estabelecimento encontrado.</div>
                ) : (
                  filteredEstablishments.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, establishmentId: e.id || 0 }));
                        if (errors.establishmentId) setErrors((prev) => ({ ...prev, establishmentId: '' }));
                        setShowEstablishmentResults(false);
                      }}
                      style={{
                        padding: '8px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        backgroundColor: form.establishmentId === e.id ? '#e6f7ff' : '#fff',
                      }}
                      onMouseEnter={(evt) => evt.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(evt) => evt.currentTarget.style.backgroundColor = form.establishmentId === e.id ? '#e6f7ff' : '#fff'}
                    >
                      {e.name} — CNPJ: {e.cnpj}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {form.establishmentId !== 0 && (
              <div style={{ padding: '8px', backgroundColor: '#e6f7ff', border: '1px solid #1890ff', borderRadius: '4px', marginBottom: '8px', color: '#0050b3' }}>
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
          </div>
        </form>
      </div>
    </div>
  );
}
