import React, { useState } from 'react';
import { CustomerForm } from './CustomerForm';
import { EstablishmentForm } from './EstablishmentForm';
import { PurchaseForm } from './PurchaseForm';
import { User, Building2, ShoppingCart } from 'lucide-react';

interface RegistrationAreaProps {
  onSuccess: () => void;
}

export const RegistrationArea: React.FC<RegistrationAreaProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'establishment' | 'purchase'>('customer');

  const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
  }> = ({ active, onClick, icon, label }) => (
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
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration Area</h2>
      
      <div className="flex gap-2 mb-6">
        <TabButton
          active={activeTab === 'customer'}
          onClick={() => setActiveTab('customer')}
          icon={<User className="w-4 h-4" />}
          label="Client Registration"
        />
        <TabButton
          active={activeTab === 'establishment'}
          onClick={() => setActiveTab('establishment')}
          icon={<Building2 className="w-4 h-4" />}
          label="Establishment Registration"
        />
        <TabButton
          active={activeTab === 'purchase'}
          onClick={() => setActiveTab('purchase')}
          icon={<ShoppingCart className="w-4 h-4" />}
          label="Purchase Registration"
        />
      </div>

      <div>
        {activeTab === 'customer' && <CustomerForm onSuccess={onSuccess} />}
        {activeTab === 'establishment' && <EstablishmentForm onSuccess={onSuccess} />}
        {activeTab === 'purchase' && <PurchaseForm onSuccess={onSuccess} />}
      </div>
    </div>
  );
};