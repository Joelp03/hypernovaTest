import React from 'react';
import { Mail, Phone, TrendingUp, TrendingDown } from 'lucide-react';

const ClientCard = ({ client, isSelected, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'default':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'paid':
        return 'Pagado';
      case 'default':
        return 'Moroso';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{client.name}</h4>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
          {getStatusLabel(client.status)}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          <span>{client.phone}</span>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Deuda Total</p>
          <p className="font-medium text-gray-900">€{client.totalDebt.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Pendiente</p>
          <p className="font-medium text-gray-900">€{client.pendingAmount.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">Probabilidad de pago</span>
        <div className="flex items-center">
          {client.paymentProbability >= 50 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${
            client.paymentProbability >= 50 ? 'text-green-600' : 'text-red-600'
          }`}>
            {client.paymentProbability}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;