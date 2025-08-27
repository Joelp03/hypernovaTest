import React from 'react';
import { Phone, CreditCard, Clock, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Timeline = ({ interactions }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'call':
        return Phone;
      case 'payment':
        return CreditCard;
      case 'promise':
        return Clock;
      case 'renegotiation':
        return RefreshCw;
      default:
        return Phone;
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'success':
        return CheckCircle;
      case 'pending':
        return AlertCircle;
      case 'failed':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'success':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'promise':
        return 'bg-yellow-100 text-yellow-600';
      case 'renegotiation':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline de Interacciones</h3>
      
      <div className="space-y-6">
        {sortedInteractions.map((interaction, index) => {
          const TypeIcon = getIcon(interaction.type);
          const ResultIcon = getResultIcon(interaction.result);
          
          return (
            <div key={interaction.id} className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(interaction.type)}`}>
                <TypeIcon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                    {interaction.amount && ` - €${interaction.amount.toLocaleString()}`}
                  </p>
                  <div className="flex items-center space-x-2">
                    <ResultIcon className={`w-4 h-4 ${getResultColor(interaction.result)}`} />
                    <span className="text-xs text-gray-500">
                      {new Date(interaction.date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600">{interaction.description}</p>
              </div>
              
              {index < sortedInteractions.length - 1 && (
                <div className="absolute left-5 mt-10 w-0.5 h-6 bg-gray-200"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;