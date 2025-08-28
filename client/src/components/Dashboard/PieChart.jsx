
import React from 'react';
import { Pie } from 'react-chartjs-2';


const PieChart = ({ data }) => {
  const dataProcessed = processDebtData(data)
  const chartData = {
    labels: dataProcessed.labels,
    datasets: [
      {
        data: dataProcessed.values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Deudas</h3>
      <div className="h-64"> {/* Altura fija */}
        <Pie data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default PieChart;

const processDebtData = (data) => {
  const debtCounts = {};
  data.forEach(cliente => {
    const { tipo_deuda } = cliente;
    if (debtCounts[tipo_deuda]) {
      debtCounts[tipo_deuda]++;
    } else {
      debtCounts[tipo_deuda] = 1;
    }
  });
  const labels = Object.keys(debtCounts);
  const values = Object.values(debtCounts);
  return { labels, values };
};
