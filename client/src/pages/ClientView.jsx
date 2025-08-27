import React, { useState } from 'react';
import ClientCard from '../components/Client/ClientCard';
import Timeline from '../components/Client/Timeline';
import DebtPanel from '../components/Client/DebtPanel';
import { mockClients, mockInteractions } from '../data/mockData';

const ClientView = () => {
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  const selectedClient = selectedClientId 
    ? mockClients.find(c => c.id === selectedClientId) 
    : null;

  const clientInteractions = selectedClientId
    ? mockInteractions.filter(i => i.clientId === selectedClientId)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vista de Clientes</h1>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            {mockClients.length} clientes registrados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Clientes</h3>
            <div className="space-y-4">
              {mockClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  isSelected={selectedClientId === client.id}
                  onSelect={() => setSelectedClientId(client.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Detalles de {selectedClient.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedClient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{selectedClient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      selectedClient.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      selectedClient.status === 'paid' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedClient.status === 'active' ? 'Activo' :
                       selectedClient.status === 'paid' ? 'Pagado' : 'Moroso'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Timeline interactions={clientInteractions} />
                </div>
                <div className="lg:col-span-1">
                  <DebtPanel client={selectedClient} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">Selecciona un cliente para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientView;