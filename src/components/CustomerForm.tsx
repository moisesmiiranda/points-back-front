import React, { useState, useCallback } from 'react';
import { Customer } from '../types';
import { User, CheckCircle } from 'lucide-react';

interface CustomerFormProps {
  onSuccess: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });
  const [errors, setErrors] = useState<Partial<Customer>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Customer> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Formato de e-mail inválido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'O telefone é obrigatório';
    }
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'O CPF é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setApiError(null); // Limpa erros anteriores ao tentar novamente
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // É uma boa prática usar variáveis de ambiente para a URL da API
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', cpf: '' });
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
        }, 2000);
      } else {
        // Tenta extrair uma mensagem de erro específica do backend
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || 'Falha ao cadastrar cliente. Por favor, tente novamente.';
        setApiError(message);
        throw new Error(message);
      }
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      // Se não houver um erro de API definido, é provável que seja um erro de rede (servidor offline)
      if (!apiError && error instanceof TypeError && error.message === 'Failed to fetch') {
        setApiError('Could not connect to the server. Is the API running?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpa o erro do campo específico ao ser alterado
    if (errors[name as keyof Customer] && value.trim()) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Cliente Cadastrado!</h3>
        <p className="text-gray-600">O cliente foi adicionado ao sistema com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Cadastrar Cliente</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
            {apiError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Digite o nome do cliente"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="customer@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="(11) 99999-9999"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPF
          </label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.cpf ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="000.000.000-00"
          />
          {errors.cpf && <p className="mt-1 text-sm text-red-600">{errors.cpf}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
        </button>
      </form>
    </div>
  );
};