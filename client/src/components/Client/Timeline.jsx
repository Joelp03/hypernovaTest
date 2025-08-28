import React from 'react';
import { Phone, Mail, CreditCard, RefreshCcw, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import moment from 'moment';

const Timeline = ({ eventos }) => {
  console.log("Timeline received eventos:", eventos);
  const getIcon = (evento) => {
    switch (evento.tipo) {
      case 'interaccion':
        if (evento.detalles?.tipo_contacto === 'llamada_saliente' || evento.detalles?.tipo_contacto === 'llamada_entrante') {
          return Phone;
        } else if (evento.detalles?.tipo_contacto === 'email') {
          return Mail;
        }
        return Phone; // Fallback
      case 'renegociacion':
        return RefreshCcw;
      case 'promesa':
        return CreditCard; // Un icono de pago para promesas de pago
      default:
        return AlertCircle;
    }
  };

  const getEventDescription = (evento) => {
    if (evento.tipo === 'interaccion' && evento.detalles) {
      return `Agente: ${evento.agente || 'N/A'} - Sentimiento: ${evento.detalles.sentimiento || 'N/A'}`;
    }
    if (evento.tipo === 'renegociacion' && evento.detalles) {
      return `Monto Total: $${evento.detalles.monto_total || 'N/A'} - Cuotas: ${evento.detalles.cuotas || 'N/A'}`;
    }
    if (evento.tipo === 'promesa' && evento.detalles) {
      return `Agente: ${evento.agente || 'N/A'} - Monto prometido: $${evento.detalles.monto_prometido || 'N/A'}`;
    }
    return evento.descripcion || 'N/A';
  };

  

  const getTypeColor = (tipo) => {
    console.log("Getting color for tipo:", tipo);
    switch (tipo) {
      case 'interaccion':
        return 'bg-blue-100 text-blue-600';
      case 'renegociacion':
        return 'bg-purple-100 text-purple-600';
      case 'promesa':
        return 'bg-yellow-100 text-yellow-600';
      case 'pago':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const sortedEventos = [...eventos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline de Interacciones</h3>
      
      <div className="space-y-6 relative">
        {sortedEventos.map((evento, index) => {
          const IconComponent = getIcon(evento);
          
          return (
            <div key={evento.id} className="flex items-start space-x-4">
              <div className="relative">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${getTypeColor(evento.tipo)}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                {index < sortedEventos.length - 1 && (
                  <div className="absolute left-1/2 top-10 w-0.5 h-full bg-gray-200 -z-0 transform -translate-x-1/2"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {evento.titulo.replace(/_/g, ' ') || evento.tipo}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTypeColor(evento.tipo)}`}>
                      {evento.estado ? evento.estado.replace(/_/g, ' ') : 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {moment(evento.fecha).format('DD/MM/YYYY')}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-600">{getEventDescription(evento)}</p>
                {evento.detalles.duracion > 0 && 
                  <p className="mt-1 text-sm text-gray-600">Duracion: {evento.detalles.duracion ? `${evento.detalles.duracion}s` : 'N/A'}</p>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;