import React from 'react';
import { Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import moment from 'moment';

const ClientCard = ({ client, isSelected, onSelect }) => {

  //  const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'hipoteca':
  //       return 'bg-blue-100 text-blue-800';
  //     case 'auto':
  //       return 'bg-green-100 text-green-800';
  //     case 'tarjeta_credito':
  //       return 'bg-red-100 text-red-800';
  //        case 'tarjeta_credito':
  //          return 'bg-red-100 text-red-800';
  // //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };


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
        {/* Nombre del cliente */}
        <h4 className="font-medium text-gray-900">{client.nombre}</h4>
        {/* Tipo de deuda */}
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
          {client.tipo_deuda}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        {/* Email - No está en la data, se usa un placeholder */}
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          <span>{client.email || 'N/A'}</span>
        </div>
        {/* Teléfono */}
        <div className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          <span>{client.telefono}</span>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {/* Monto de la deuda inicial */}
        <div>
          <p className="text-gray-500">Monto de Deuda Inicial</p>
          <p className="font-medium text-gray-900">
            <DollarSign className="inline-block w-4 h-4 mr-1" />
            {client.monto_deuda_inicial.toLocaleString()}
          </p>
        </div>
        {/* Fecha del préstamo */}
        <div>
          <p className="text-gray-500">Fecha de Préstamo</p>
          <p className="font-medium text-gray-900">
            <Calendar className="inline-block w-4 h-4 mr-1" />
            {moment(client.fecha_prestamo).format('DD/MM/YYYY')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;