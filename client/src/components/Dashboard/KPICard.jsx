import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ label, value, change, color }) => {
  const isPositive = change > 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }}></div>
        </div>
      </div>
      
      <div className="flex items-center mt-4">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
      </div>
    </div>
  );
};

export default KPICard;