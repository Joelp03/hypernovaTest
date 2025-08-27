export const mockClients = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@email.com',
    phone: '+34 600 123 456',
    totalDebt: 5000,
    paidAmount: 2000,
    pendingAmount: 3000,
    status: 'active',
    paymentProbability: 75
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos.lopez@email.com',
    phone: '+34 600 789 012',
    totalDebt: 8500,
    paidAmount: 8500,
    pendingAmount: 0,
    status: 'paid',
    paymentProbability: 100
  },
  {
    id: '3',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@email.com',
    phone: '+34 600 345 678',
    totalDebt: 3200,
    paidAmount: 800,
    pendingAmount: 2400,
    status: 'default',
    paymentProbability: 25
  }
];

export const mockInteractions = [
  {
    id: '1',
    clientId: '1',
    type: 'call',
    date: '2024-01-15',
    description: 'Llamada inicial de contacto',
    result: 'success'
  },
  {
    id: '2',
    clientId: '1',
    type: 'payment',
    date: '2024-01-20',
    amount: 1000,
    description: 'Pago parcial acordado',
    result: 'success'
  },
  {
    id: '3',
    clientId: '1',
    type: 'promise',
    date: '2024-01-25',
    amount: 500,
    description: 'Promesa de pago para fin de mes',
    result: 'pending'
  },
  {
    id: '4',
    clientId: '2',
    type: 'renegotiation',
    date: '2024-01-10',
    description: 'Renegociación de plan de pagos',
    result: 'success'
  }
];

export const debtTypes = [
  { name: 'Hipotecario', value: 45, color: '#3B82F6' },
  { name: 'Tarjetas de Crédito', value: 30, color: '#10B981' },
  { name: 'Préstamos Personales', value: 20, color: '#F59E0B' },
  { name: 'Otros', value: 5, color: '#EF4444' }
];

export const kpis = [
  { label: 'Tasa de Recuperación', value: '68%', change: 12, color: '#10B981' },
  { label: 'Promesas Cumplidas', value: '142', change: 8, color: '#3B82F6' },
  { label: 'Deuda Activa', value: '€2.4M', change: -5, color: '#F59E0B' },
  { label: 'Deuda Recuperada', value: '€1.6M', change: 15, color: '#10B981' }
];

export const graphNodes = [
  { id: 'client1', label: 'Ana García', type: 'client', x: 100, y: 150 },
  { id: 'client2', label: 'Carlos López', type: 'client', x: 300, y: 100 },
  { id: 'client3', label: 'María R.', type: 'client', x: 250, y: 250 },
  { id: 'agent1', label: 'Agente Juan', type: 'agent', x: 200, y: 150 },
  { id: 'debt1', label: 'Deuda #1001', type: 'debt', x: 150, y: 50 },
  { id: 'payment1', label: 'Pago €1000', type: 'payment', x: 350, y: 200 }
];

export const graphEdges = [
  { source: 'client1', target: 'agent1', type: 'promised', weight: 2 },
  { source: 'client2', target: 'agent1', type: 'paid', weight: 5 },
  { source: 'client3', target: 'agent1', type: 'renegotiated', weight: 1 },
  { source: 'agent1', target: 'debt1', type: 'promised', weight: 3 },
  { source: 'client2', target: 'payment1', type: 'paid', weight: 4 }
];

export const monthlyData = [
  { month: 'Ene', interactions: 120, payments: 85, promises: 45 },
  { month: 'Feb', interactions: 135, payments: 92, promises: 38 },
  { month: 'Mar', interactions: 148, payments: 105, promises: 52 },
  { month: 'Abr', interactions: 162, payments: 118, promises: 41 },
  { month: 'May', interactions: 178, payments: 134, promises: 48 },
  { month: 'Jun', interactions: 185, payments: 142, promises: 55 }
];