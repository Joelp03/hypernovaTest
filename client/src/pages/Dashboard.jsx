import React, { useEffect, useState } from 'react';
import KPICard from '../components/Dashboard/KPICard';
import PieChart from '../components/Dashboard/PieChart';
import LineChart from '../components/Dashboard/LineChart';
import { processKPIs } from '../services/processData';
import BarChart from '../components/Dashboard/BarChart';
import {  fetchAgentsDetails, fetchClients, fetchHoursEffectiveness, fetchPromisesIncomplete } from '../services/api';

const Dashboard = () => {
    const [data, setData] = useState({
    promisesIncomplete: [],
    clients: [],
    hoursEffectiveness: [],
    agents: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [ promisesResponse,  clientsResponse,  hoursEffectivenessResponse, agentsResponse] = await Promise.all([
        fetchPromisesIncomplete(),
        fetchClients(),
        fetchHoursEffectiveness(),
        fetchAgentsDetails(),
      ]);

      setData({
        promisesIncomplete: promisesResponse.data,
        clients: clientsResponse.data,
        hoursEffectiveness: hoursEffectivenessResponse.data,
        agents: agentsResponse.data,
      });

    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Cobranzas</h1>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {processKPIs(data.promisesIncomplete).map((kpi, index) => (
          <KPICard
            key={index}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart data={data.clients} />
        <div className="lg:col-span-1">
          <LineChart data={data.hoursEffectiveness} title="Eficiencia Horaria" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
            <BarChart data={data.agents} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

