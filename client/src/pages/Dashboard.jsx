import React, { useEffect, useState } from 'react';
import KPICard from '../components/Dashboard/KPICard';
import PieChart from '../components/Dashboard/PieChart';
import LineChart from '../components/Dashboard/LineChart';
import { monthlyData } from '../data/mockData';
import { fetchClients, fetchPromisesIncomplete } from '../services/api';
import moment from 'moment';

const Dashboard = () => {
  const [promisesIncomplete, setPromisesIncomplete] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData();
  }, [])
  
  const fetchData = async () => {
    setLoading(true);
    const response = await fetchPromisesIncomplete();
    const clients = await fetchClients()
    setPromisesIncomplete(response.data);
    setClients(clients.data);
    setLoading(false);
  }

  


  if(loading && !promisesIncomplete.length) {
    return <div>Cargando...</div>;
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
        {processKPIs(promisesIncomplete).map((kpi, index) => (
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
        <PieChart data={clients} />
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


const processKPIs = (data) => {
  const now = moment();
  const currentMonthData = data.filter(d => moment(d.fechaPromesa).month() === now.month());
  const previousMonthData = data.filter(d => moment(d.fechaPromesa).month() === now.clone().subtract(1, 'month').month());

  // KPI 1: Promesas Realizadas
  const promesasActual = currentMonthData.length;
  const promesasAnterior = previousMonthData.length;
  const changePromesas = promesasAnterior > 0 ? ((promesasActual - promesasAnterior) / promesasAnterior) * 100 : (promesasActual > 0 ? 100 : 0);
  
  const kpi1 = {
    label: "Promesas Realizadas",
    value: promesasActual,
    change: parseFloat(changePromesas.toFixed(2)),
    color: "#6366f1"
  };

  // KPI 2: Porcentaje de Éxito en Pagos
  const pagadasActual = currentMonthData.filter(d => d.totalPagado > 0).length;
  const porcentajeExitoActual = promesasActual > 0 ? (pagadasActual / promesasActual) * 100 : 0;
  const pagadasAnterior = previousMonthData.filter(d => d.totalPagado > 0).length;
  const porcentajeExitoAnterior = promesasAnterior > 0 ? (pagadasAnterior / promesasAnterior) * 100 : 0;
  const changeExito = porcentajeExitoAnterior > 0 ? ((porcentajeExitoActual - porcentajeExitoAnterior) / porcentajeExitoAnterior) * 100 : (porcentajeExitoActual > 0 ? 100 : 0);
  
  const kpi2 = {
    label: "Promesas Pagadas (%)",
    value: `${porcentajeExitoActual.toFixed(2)}%`,
    change: parseFloat(changeExito.toFixed(2)),
    color: "#22c55e"
  };

  const montoActual = currentMonthData.reduce((sum, d) => sum + d.totalPagado, 0);
  const montoAnterior = previousMonthData.reduce((sum, d) => sum + d.totalPagado, 0);
  const changeMonto = montoAnterior > 0 ? ((montoActual - montoAnterior) / montoAnterior) * 100 : (montoActual > 0 ? 100 : 0);

  const kpi3 = {
    label: "Monto Total Cobrado",
    value: `$${montoActual}`,
    change: parseFloat(changeMonto.toFixed(2)),
    color: "#f97316"
  };

  return [kpi1, kpi2, kpi3];
};