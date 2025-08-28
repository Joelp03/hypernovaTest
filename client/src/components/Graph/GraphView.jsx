// GrafoView.jsx
import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const GrafoView = ({ data }) => {
  const fgRef = useRef();

  useEffect(() => {
    // Centrar la cámara en el grafo
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50);
    }
  }, [data]);

  // Función para colorear nodos por tipo
  const nodeColor = (node) => {
    switch (node.label) {
      case 'Cliente':
        return '#1f77b4';
      case 'Agente':
        return '#ff7f0e';
      case 'Deuda':
        return '#2ca02c';
      case 'Interaccion':
        return '#d62728';
      case 'Pago':
        return '#9467bd';
      case 'PromesaDePago':
        return '#8c564b';
      case 'Renegociacion':
        return '#e377c2';
      default:
        return '#7f7f7f';
    }
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeAutoColorBy="label"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.nombre || node.id;
          const fontSize = 9 / globalScale;
          const radius = 30;
          ctx.fillStyle = nodeColor(node);
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.fillStyle = 'black';
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(label, node.x, node.y + 6);
        }}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkLabel={(link) => link.type}
        nodeLabel={(node) => `${node.label}: ${node.nombre || node.id}`}
      />
    </div>
  );
};

export default GrafoView;
