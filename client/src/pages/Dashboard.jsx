import React from 'react';
import KPICard from '../components/Dashboard/KPICard';
import PieChart from '../components/Dashboard/PieChart';
import LineChart from '../components/Dashboard/LineChart';
import { kpis, debtTypes, monthlyData } from '../data/mockData';

const Dashboard = () => {
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
        {kpis.map((kpi, index) => (
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
        <PieChart data={debtTypes} />
        <div className="lg:col-span-1">
          <LineChart data={monthlyData} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Pago recibido</p>
              <p className="text-xs text-gray-600">Ana García - €1,000</p>
            </div>
            <span className="text-xs text-gray-500">Hace 2 horas</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Nueva promesa de pago</p>
              <p className="text-xs text-gray-600">Carlos López - €500 para el 30/01</p>
            </div>
            <span className="text-xs text-gray-500">Hace 4 horas</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">Renegociación completada</p>
              <p className="text-xs text-gray-600">María Rodríguez - Plan de 6 meses</p>
            </div>
            <span className="text-xs text-gray-500">Ayer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;