import React, { useEffect, useState } from 'react';
import ClientCard from '../components/Client/ClientCard';
import Timeline from '../components/Client/Timeline';
import DebtPanel from '../components/Client/DebtPanel';
import { fetchClients } from '../services/api';
import ClientDetails from '../components/Client/ClientDetails';

const ClientView = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(); 
  }, [])
  
  const fetchData = async () => {
    setLoading(true);
    const response = await fetchClients();
    setClients(response.data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vista de Clientes</h1>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            {clients.length} clientes registrados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Clientes</h3>
            <div className="space-y-4">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  isSelected={selectedClient?.id === client.id}
                  onSelect={() => setSelectedClient(client)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Client Details */}
        <ClientDetails clientId={selectedClient?.id} />
      </div>
    </div>
  );
};

export default ClientView;