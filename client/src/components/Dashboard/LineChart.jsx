import React from 'react';

const LineChart = ({ data }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.interactions, d.payments, d.promises]));
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = 40;

  const getY = (value) => {
    return chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));
  };

  const getX = (index) => {
    return padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
  };

  const createPath = (values) => {
    return values
      .map((value, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(value)}`)
      .join(' ');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Mensual</h3>
      
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i * (chartHeight - 2 * padding)) / 4;
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const value = Math.round((maxValue * (4 - i)) / 4);
            const y = padding + (i * (chartHeight - 2 * padding)) / 4;
            return (
              <text
                key={i}
                x={padding - 10}
                y={y + 5}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            );
          })}

          {/* Lines */}
          <path
            d={createPath(data.map(d => d.interactions))}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            className="drop-shadow-sm"
          />
          <path
            d={createPath(data.map(d => d.payments))}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            className="drop-shadow-sm"
          />
          <path
            d={createPath(data.map(d => d.promises))}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {data.map((item, index) => (
            <g key={index}>
              <circle cx={getX(index)} cy={getY(item.interactions)} r="4" fill="#3B82F6" />
              <circle cx={getX(index)} cy={getY(item.payments)} r="4" fill="#10B981" />
              <circle cx={getX(index)} cy={getY(item.promises)} r="4" fill="#F59E0B" />
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((item, index) => (
            <text
              key={index}
              x={getX(index)}
              y={chartHeight - 10}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {item.month}
            </text>
          ))}
        </svg>

        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Interacciones</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Pagos</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Promesas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineChart;