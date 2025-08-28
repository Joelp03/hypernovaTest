import React, { useEffect, useState } from 'react';
import { fetchGraphData } from '../services/api';
import GraphView from '../components/Graph/GraphView';

const GraphPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [selectedLinkType, setSelectedLinkType] = useState(null); // Nuevo estado para tipo de enlace

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchGraphData();
      console.log(response.data[0]);
      setData(response.data[0]);
    } catch (error) {
      console.error('Error fetching graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  // Obtener tipos de enlaces únicos para el selector
  const linkTypes = [...new Set(data?.links.map(link => link.type))];
  const labelsTypes = [...new Set(data?.nodes.map(node => node.label))];



const getFilteredGraphData = (sourceData, selectedLabel, selectedLinkType) => {


  if (!sourceData || !sourceData.nodes || !sourceData.links) {
    return { nodes: [], links: [] };
  }

  // 1. Filtrar los enlaces por tipo
  let finalLinks = sourceData.links;
  if (selectedLinkType) {
    finalLinks = sourceData.links.filter(
      link => (link.type || "").toUpperCase() === selectedLinkType.toUpperCase()
    );
  }

  // 2. IDs de nodos conectados a esos enlaces
  const linkedNodeIds = new Set();
  finalLinks.forEach(link => {
    const sourceId = typeof link.source === "object" ? link.source.id : link.source;
    const targetId = typeof link.target === "object" ? link.target.id : link.target;
    linkedNodeIds.add(sourceId);
    linkedNodeIds.add(targetId);
  });


  // 3. Filtrar nodos conectados que además cumplen con el label
  const finalNodes = sourceData.nodes.filter(node => {
    const isLinked = linkedNodeIds.has(node.id);
    const hasCorrectLabel = !selectedLabel || node.label === selectedLabel;
    return isLinked && hasCorrectLabel;
  });

  return {
    nodes: finalNodes,
    links: finalLinks.map(link => ({
      ...link,
      source: typeof link.source === "object" ? link.source.id : link.source,
      target: typeof link.target === "object" ? link.target.id : link.target
    }))
  };
};


  const filteredData = getFilteredGraphData(data, selectedLabel, selectedLinkType);

  console.log("filteredData :", filteredData);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vista de Relaciones</h1>
      <p className="mb-4">Visualización interactiva de conexiones</p>

      {/* Selector para el cliente */}
      <select
        className="border p-2 mb-4"
        onChange={e => setSelectedLabel(e.target.value || null)}
        defaultValue=""
      >
        <option value="">Selecciona un tipo de nodo</option>
        {labelsTypes.map(label => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
 

      {/* Selector para el tipo de enlace */}
      <select
        className="border p-2 mb-4 ml-4"
        onChange={e => setSelectedLinkType(e.target.value || null)}
        defaultValue=""
      >
        <option value="">Selecciona un tipo de enlace</option>
        {linkTypes.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {/* Contenedor para el grafo */}
      <div className="w-full h-[600px]">
        {data && <GraphView data={filteredData} />}
      </div>
    </div>
  );
};

export default GraphPage;