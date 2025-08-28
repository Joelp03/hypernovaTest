import React from 'react'
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data }) => {

    const labels = data.map((agente) => agente.nombre);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Interacciones",
        data: data.map((agente) => agente.total_interacciones),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Promesas Totales",
        data: data.map((agente) => agente.promesas_totales),
        backgroundColor: "rgba(255, 159, 64, 0.7)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
      {
        label: "Renegociaciones Totales",
        data: data.map((agente) => agente.total_renegociaciones),
        backgroundColor: "rgba(153, 102, 255, 0.7)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };


  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Efectividad de Agentes - Comparación",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />; 
}

export default BarChart
