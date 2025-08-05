import React, { useState, useEffect } from 'react';
import { Customer, Establishment, Purchase } from '../types';
import { Users, Building2, ShoppingCart, RefreshCw, Edit, Star } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { EditModal } from './EditModal';

export const DataVisualization: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'establishments' | 'purchases'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    data: any;
    type: 'customer' | 'establishment' | 'purchase';
  }>({
    isOpen: false,
    data: null,
    type: 'customer'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersRes, establishmentsRes, purchasesRes] = await Promise.all([
        fetch('http://localhost:8080/clients/all'),
        fetch('http://localhost:8080/establishments/list'),
        fetch('http://localhost:8080/purchases')
      ]);

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (establishmentsRes.ok) {
        const establishmentsData = await establishmentsRes.json();
        setEstablishments(establishmentsData);
      }

      if (purchasesRes.ok) {
        const purchasesData = await purchasesRes.json();
        setPurchases(purchasesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCustomerName = (clientId: number): string => {
    const customer = customers.find(c => c.id === clientId);
    return customer?.name || `Customer #${clientId}`;
  };

  const getEstablishmentName = (establishmentId: number): string => {
    const establishment = establishments.find(e => e.id === establishmentId);
    return establishment?.name || `Establishment #${establishmentId}`;
  };

  const getCustomerPoints = (customerId: number): number => {
    return purchases
      .filter(p => p.clientId === customerId)
      .reduce((total, purchase) => {
        const establishment = establishments.find(e => e.id === purchase.establishmentId);
        if (establishment) {
          return total + (purchase.purchaseValue / establishment.valuePerPoint);
        }
        return total;
      }, 0);
  };

  const handleEdit = (data: any, type: 'customer' | 'establishment' | 'purchase') => {
    setEditModal({ isOpen: true, data, type });
  };

  const handleSave = async (updatedData: any) => {
    try {
      let endpoint = '';
      let method = 'PUT';
      
      switch (editModal.type) {
        case 'customer':
          endpoint = `http://localhost:8080/clients/${updatedData.id}`;
          break;
        case 'establishment':
          endpoint = `http://localhost:8080/establishments/${updatedData.id}`;
          break;
        case 'purchase':
          endpoint = `http://localhost:8080/purchases/${updatedData.id}`;
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setEditModal({ isOpen: false, data: null, type: 'customer' });
        fetchData(); // Refresh data
      } else {
        console.error('Failed to update record');
      }
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const filterData = (data: any[], searchTerm: string) => {
    if (!searchTerm) return data;
    
    return data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower) ||
        item.phone?.toLowerCase().includes(searchLower) ||
        item.cpf?.toLowerCase().includes(searchLower) ||
        item.cnpj?.toLowerCase().includes(searchLower)
      );
    });
  };

  const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count: number;
  }> = ({ active, onClick, icon, label, count }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
      <span className={`px-2 py-1 rounded-full text-xs ${
        active ? 'bg-blue-500' : 'bg-gray-300'
      }`}>
        {count}
      </span>
    </button>
  );

  const filteredCustomers = filterData(customers, searchTerm);
  const filteredEstablishments = filterData(establishments, searchTerm);
  const filteredPurchases = purchases.filter(purchase => {
    if (!searchTerm) return true;
    const customerName = getCustomerName(purchase.clientId).toLowerCase();
    const establishmentName = getEstablishmentName(purchase.establishmentId).toLowerCase();
    return customerName.includes(searchTerm.toLowerCase()) || 
           establishmentName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Data Visualization</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <TabButton
          active={activeTab === 'customers'}
          onClick={() => setActiveTab('customers')}
          icon={<Users className="w-4 h-4" />}
          label="Customers"
          count={customers.length}
        />
        <TabButton
          active={activeTab === 'establishments'}
          onClick={() => setActiveTab('establishments')}
          icon={<Building2 className="w-4 h-4" />}
          label="Establishments"
          count={establishments.length}
        />
        <TabButton
          active={activeTab === 'purchases'}
          onClick={() => setActiveTab('purchases')}
          icon={<ShoppingCart className="w-4 h-4" />}
          label="Purchases"
          count={purchases.length}
        />
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={`Search ${activeTab}...`}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'customers' && (
            <div>
              {filteredCustomers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm ? 'No customers found matching your search.' : 'No customers registered yet.'}
                </p>
              ) : (
                <div className="grid gap-4">
                  {filteredCustomers.map((customer) => {
                    const points = getCustomerPoints(customer.id!);
                    return (
                      <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                                <Star className="w-3 h-3" />
                                {points.toFixed(0)} points
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div>Email: {customer.email}</div>
                              <div>Phone: {customer.phone}</div>
                              <div>CPF: {customer.cpf}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEdit(customer, 'customer')}
                            className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'establishments' && (
            <div>
              {filteredEstablishments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm ? 'No establishments found matching your search.' : 'No establishments registered yet.'}
                </p>
              ) : (
                <div className="grid gap-4">
                  {filteredEstablishments.map((establishment) => (
                    <div key={establishment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{establishment.name}</h3>
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              R$ {establishment.valuePerPoint}/point
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>Email: {establishment.email}</div>
                            <div>Phone: {establishment.phone}</div>
                            <div>CNPJ: {establishment.cnpj}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEdit(establishment, 'establishment')}
                          className="ml-4 p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchases' && (
            <div>
              {filteredPurchases.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm ? 'No purchases found matching your search.' : 'No purchases registered yet.'}
                </p>
              ) : (
                <div className="grid gap-4">
                  {filteredPurchases.map((purchase) => (
                    <div key={purchase.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              Purchase #{purchase.id}
                            </h3>
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              R$ {purchase.purchaseValue.toFixed(2)}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>Customer: {getCustomerName(purchase.clientId)}</div>
                            <div>Establishment: {getEstablishmentName(purchase.establishmentId)}</div>
                          </div>
                          {purchase.purchaseDate && (
                            <div className="mt-1 text-sm text-gray-500">
                              Date: {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleEdit(purchase, 'purchase')}
                          className="ml-4 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, data: null, type: 'customer' })}
        onSave={handleSave}
        data={editModal.data}
        type={editModal.type}
        customers={customers}
        establishments={establishments}
      />
    </div>
  );
};