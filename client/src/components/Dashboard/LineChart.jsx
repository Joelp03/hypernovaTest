import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChart = ({ data, title }) => {
  const dataProcessed = processLineData(data);
  const chartData = {
    labels: dataProcessed.labels,
    datasets: [
      {
        label: title,
        data: dataProcessed.efectividadValues,
        fill: false,
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
      },
    ],
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <Line data={chartData} />
    </div>
  );
};


const processLineData = (data) => {
  const labels = data.map(item => `Hora ${item.hora}`);

  const efectividadValues = data.map(item => item.efectividad);

  return { labels, efectividadValues };
};

export default LineChart;