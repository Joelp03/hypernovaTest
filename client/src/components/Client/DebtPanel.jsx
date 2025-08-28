import React from 'react';
import { DollarSign, Tag, Calendar, BarChart } from 'lucide-react';

const DebtPanel = ({ deudaActual, montoPrometido }) => {
  console.log("DebtPanel received deudaActual:", deudaActual);
  if (!deudaActual) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <p className="text-sm text-gray-500">No hay datos de deuda disponibles.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-red-50 text-red-600';
      case 'activa':
        return 'bg-blue-50 text-blue-600';
      case 'pagada':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de la Deuda</h3>
      
      <div className="space-y-4">
        {/* Tipo de deuda */}
        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
          <Tag className="w-5 h-5 mr-3 text-gray-600" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-600">Tipo de Deuda</span>
            <p className="text-lg font-bold text-gray-900 capitalize">{deudaActual.tipo_deuda.replace(/_/g, ' ')}</p>
          </div>
        </div>
        
        {/* Monto actual */}
        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
          <DollarSign className="w-5 h-5 mr-3 text-gray-600" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-600">Monto Actual</span>
            <p className="text-lg font-bold text-gray-900">${deudaActual.monto_actual.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Monto original */}
        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
          <BarChart className="w-5 h-5 mr-3 text-gray-600" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-600">Monto Prometido</span>
            <p className="text-lg font-bold text-gray-900">${montoPrometido.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Estado */}
        <div className={`flex items-center p-4 rounded-lg ${getStatusColor(deudaActual.estado)}`}>
          <Calendar className="w-5 h-5 mr-3" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-600">Estado</span>
            <p className="text-lg font-bold capitalize">{deudaActual.estado || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtPanel;