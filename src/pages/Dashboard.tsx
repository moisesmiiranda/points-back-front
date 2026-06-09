import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { purchaseService } from '../services/purchaseService';
import { establishmentService } from '../services/establishmentService';
import { clientService } from '../services/clientService';
import LoadingSpinner from '../components/LoadingSpinner';
import type { PurchaseDto, EstablishmentDto } from '../types';

interface ChartData {
  name: string;
  total: number;
}

const COLORS = ['#6c5ce7', '#a855f7', '#00cec9', '#fdcb6e', '#ff6b6b', '#00b894', '#e17055', '#74b9ff'];

export default function Dashboard() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalEstablishments, setTotalEstablishments] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [purchasesRes, establishmentsRes, clientsRes] = await Promise.all([
        purchaseService.getAll(),
        establishmentService.getAll(),
        clientService.getAll(),
      ]);

      const purchases: PurchaseDto[] = purchasesRes.data;
      const establishments: EstablishmentDto[] = establishmentsRes.data;

      setTotalPurchases(purchases.length);
      setTotalClients(clientsRes.data.length);
      setTotalEstablishments(establishments.length);

      const estMap = new Map<number, string>();
      establishments.forEach((e) => {
        if (e.id !== undefined) estMap.set(e.id, e.name);
      });

      const grouped = new Map<number, number>();
      let revenue = 0;
      purchases.forEach((p) => {
        const amt = parseFloat(String(p.amount)) || 0;
        revenue += amt;
        const prev = grouped.get(p.establishmentId) || 0;
        grouped.set(p.establishmentId, prev + amt);
      });
      setTotalRevenue(revenue);

      const data: ChartData[] = [];
      grouped.forEach((total, estId) => {
        data.push({
          name: estMap.get(estId) || `Est. #${estId}`,
          total: parseFloat(total.toFixed(2)),
        });
      });
      data.sort((a, b) => b.total - a.total);
      setChartData(data);
    } catch {
      // API not available – show empty state
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Visão geral do sistema de pontuação</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-value">{totalPurchases}</div>
          <div className="stat-label">Total de Compras</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="stat-label">Receita Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{totalClients}</div>
          <div className="stat-label">Clientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-value">{totalEstablishments}</div>
          <div className="stat-label">Estabelecimentos</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-title">📊 Total de Compras por Estabelecimento</div>
          {chartData.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📈</div>
              <p>Nenhuma compra registrada ainda.</p>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,160,0.15)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    angle={-30}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Total']}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="card">
            <div className="card-title">🏆 Ranking de Estabelecimentos</div>
            <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Estabelecimento</th>
                    <th>Total em Compras</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((item, i) => (
                    <tr key={i}>
                      <td style={{ color: COLORS[i % COLORS.length], fontWeight: 700 }}>{i + 1}º</td>
                      <td>{item.name}</td>
                      <td style={{ fontWeight: 600 }}>R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
