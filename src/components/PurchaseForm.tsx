import React, { useState, useEffect } from 'react';
import { Purchase, Customer, Establishment } from '../types';
import { ShoppingCart } from 'lucide-react';

interface PurchaseFormProps {
  onSuccess: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<Purchase>({
    clientId: 0,
    establishmentId: 0,
    amount: 0,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof Purchase, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchEstablishments();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:8080/clients/all');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchEstablishments = async () => {
    try {
      const response = await fetch('http://localhost:8080/establishments/list');
      if (response.ok) {
        const data = await response.json();
        setEstablishments(data);
      }
    } catch (error) {
      console.error('Error fetching establishments:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Purchase, string>> = {};

    if (!formData.clientId || formData.clientId <= 0) {
      newErrors.clientId = 'Please select a customer';
    }
    if (!formData.establishmentId || formData.establishmentId <= 0) {
      newErrors.establishmentId = 'Please select an establishment';
    }
    if (!formData.amount || formData.amount <= 0) { 
      newErrors.amount = 'Purchase amount must be greater than 0'; 
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ clientId: 0, establishmentId: 0, amount: 0 }); 
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
        }, 2000);
      } else {
        throw new Error('Failed to register purchase');
      }
    } catch (error) {
      console.error('Error registering purchase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'amount' ? parseFloat(value) || 0 : 
                         name === 'clientId' || name === 'establishmentId' ? parseInt(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name as keyof Purchase]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Purchase Registered!</h3>
        <p className="text-gray-600">The purchase has been successfully recorded in the system.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Register Purchase</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer
          </label>
          <select
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.clientId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value={0}>Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
          {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Establishment
          </label>
          <select
            name="establishmentId"
            value={formData.establishmentId}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.establishmentId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value={0}>Select an establishment</option>
            {establishments.map((establishment) => (
              <option key={establishment.id} value={establishment.id}>
                {establishment.name} - R$ {establishment.valuePerPoint}/point
              </option>
            ))}
          </select>
          {errors.establishmentId && <p className="mt-1 text-sm text-red-600">{errors.establishmentId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Amount (R$)
          </label>
          <input
            type="number"
            name="amount" 
            value={formData.amount} 
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
              errors.amount ? 'border-red-300' : 'border-gray-300' 
            }`}
            placeholder="0.00"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Register Purchase'}
        </button>
      </form>
    </div>
  );
};