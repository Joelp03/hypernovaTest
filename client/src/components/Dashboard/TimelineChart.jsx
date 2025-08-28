import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

// Registra los componentes de Chart.js que vas a usar
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TimelineChart= ({ data }) => {
  if (!data || !data.eventos) {
    return <div className="p-4 text-center text-gray-500">No hay datos de eventos disponibles para mostrar.</div>;
  }

  const eventosOrdenados = [...data.eventos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const labels = eventosOrdenados.map(evento => {
    // Formatea la fecha para que sea más legible en la línea de tiempo
    return moment(evento.fecha).format('MMM DD, YYYY');
  });


  const chartData = {
    labels,
    datasets: [{
      label: 'Historial de Eventos del Cliente',
      data: labels.map((_, index) => index + 1), // Usa un valor incremental para representar el tiempo
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      pointStyle: 'circle',
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        text: 'Línea de Tiempo de Eventos del Usuario',
        font: {
          size: 18,
          weight: 'bold',
        }
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return `Fecha: ${labels[index]}`;
          },
          label: (context) => {
            const index = context.dataIndex;
            const evento = eventosOrdenados[index];
            let details = [
              `Tipo: ${evento.tipo}`,
              `Título: ${evento.titulo}`,
              `Descripción: ${evento.descripcion || 'N/A'}`
            ];
            
            // Agrega detalles específicos si están disponibles
            if (evento.tipo === 'interaccion' && evento.detalles) {
              details.push(`Sentimiento: ${evento.detalles.sentimiento || 'N/A'}`);
              details.push(`Duración: ${evento.detalles.duracion ? `${evento.detalles.duracion}s` : 'N/A'}`);
            } else if (evento.tipo === 'renegociacion' && evento.detalles) {
              details.push(`Monto: $${evento.detalles.monto_total}`);
              details.push(`Cuotas: ${evento.detalles.cuotas}`);
            } else if (evento.tipo === 'promesa' && evento.detalles) {
               details.push(`Monto prometido: $${evento.detalles.monto_prometido}`);
            }

            return details;
          },
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fecha del Evento'
        },
        grid: {
          display: false,
        }
      },
      y: {
        display: false, // Oculta el eje Y ya que no necesitamos un valor numérico
      }
    },
  
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Timeline del Cliente</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TimelineChart;