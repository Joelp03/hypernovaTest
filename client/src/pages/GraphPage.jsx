import React from 'react';
import { graphNodes, graphEdges } from '../data/mockData';
import GraphComponent from '../components/Graph/GraphComponent';

const GraphPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vista de Relaciones</h1>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Visualización interactiva de conexiones
          </span>
        </div>
      </div>

      <GraphComponent nodes={graphNodes} edges={graphEdges} />

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Grafo</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total de Nodos</span>
              <span className="text-sm font-medium text-gray-900">{graphNodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total de Conexiones</span>
              <span className="text-sm font-medium text-gray-900">{graphEdges.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Clientes Conectados</span>
              <span className="text-sm font-medium text-gray-900">
                {graphNodes.filter(n => n.type === 'client').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Agentes Activos</span>
              <span className="text-sm font-medium text-gray-900">
                {graphNodes.filter(n => n.type === 'agent').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Relación</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Pagado</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {graphEdges.filter(e => e.type === 'paid').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Prometido</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {graphEdges.filter(e => e.type === 'promised').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Renegociado</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {graphEdges.filter(e => e.type === 'renegotiated').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphPage;