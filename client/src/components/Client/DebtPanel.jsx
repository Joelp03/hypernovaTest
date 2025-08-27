import React from 'react';

const DebtPanel = ({ client }) => {
  const paymentProgress = (client.paidAmount / client.totalDebt) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de la Deuda</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Total de la Deuda</span>
          <span className="text-lg font-bold text-gray-900">€{client.totalDebt.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Cantidad Pagada</span>
          <span className="text-lg font-bold text-green-600">€{client.paidAmount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Cantidad Pendiente</span>
          <span className="text-lg font-bold text-red-600">€{client.pendingAmount.toLocaleString()}</span>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progreso del Pago</span>
            <span className="text-sm text-gray-500">{Math.round(paymentProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${paymentProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Predicción de Comportamiento</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Probabilidad de pago (30 días)</span>
            <div className="flex items-center">
              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className={`h-2 rounded-full ${
                    client.paymentProbability >= 70 ? 'bg-green-500' :
                    client.paymentProbability >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${client.paymentProbability}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{client.paymentProbability}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtPanel;