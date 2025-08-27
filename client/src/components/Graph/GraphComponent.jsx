import React, { useState } from 'react';

const GraphComponent = ({ nodes, edges }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters] = useState({
    relationType: 'all',
    timeRange: 'all'
  });

  const getNodeColor = (type) => {
    switch (type) {
      case 'client':
        return '#3B82F6';
      case 'agent':
        return '#10B981';
      case 'debt':
        return '#F59E0B';
      case 'payment':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getEdgeColor = (type) => {
    switch (type) {
      case 'paid':
        return '#10B981';
      case 'promised':
        return '#F59E0B';
      case 'renegotiated':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const filteredEdges = edges.filter(edge => {
    if (filters.relationType !== 'all' && edge.type !== filters.relationType) {
      return false;
    }
    return true;
  });

  const connectedNodes = new Set(
    filteredEdges.flatMap(edge => [edge.source, edge.target])
  );

  const filteredNodes = nodes.filter(node => 
    filters.relationType === 'all' || connectedNodes.has(node.id)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">Grafo de Relaciones</h3>
        
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.relationType}
            onChange={(e) => setFilters({...filters, relationType: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas las relaciones</option>
            <option value="paid">Pagado</option>
            <option value="promised">Prometido</option>
            <option value="renegotiated">Renegociado</option>
          </select>
          
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todo el tiempo</option>
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <svg width="100%" height="400" viewBox="0 0 500 400" className="border border-gray-200 rounded-lg">
          {/* Edges */}
          {filteredEdges.map((edge, index) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return (
              <line
                key={index}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={getEdgeColor(edge.type)}
                strokeWidth={Math.max(1, edge.weight)}
                opacity={0.7}
                className="hover:opacity-100 transition-opacity"
              />
            );
          })}
          
          {/* Nodes */}
          {filteredNodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={selectedNode === node.id ? 25 : 20}
                fill={getNodeColor(node.type)}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:stroke-gray-400 transition-all"
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              />
              <text
                x={node.x}
                y={node.y + 35}
                textAnchor="middle"
                className="text-xs fill-gray-700 font-medium pointer-events-none"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">Cliente</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Agente</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-600">Deuda</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Pago</span>
          </div>
        </div>

        {selectedNode && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Información del Nodo</h4>
            <p className="text-sm text-gray-600">
              {nodes.find(n => n.id === selectedNode)?.label} - 
              Tipo: {nodes.find(n => n.id === selectedNode)?.type}
            </p>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Conexiones:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {edges
                  .filter(e => e.source === selectedNode || e.target === selectedNode)
                  .map((edge, index) => (
                    <span key={index} className="text-xs bg-white px-2 py-1 rounded border">
                      {edge.type}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphComponent;