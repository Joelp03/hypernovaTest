import moment from "moment";

export const processKPIs = (data) => {
  const now = moment();
  const currentMonthData = data.filter(d => moment(d.fechaPromesa).month() === now.month());
  const previousMonthData = data.filter(d => moment(d.fechaPromesa).month() === now.clone().subtract(1, 'month').month());

  // KPI 1: Promesas Realizadas
  const promesasActual = currentMonthData.length;
  const promesasAnterior = previousMonthData.length;
  const changePromesas = promesasAnterior > 0 ? ((promesasActual - promesasAnterior) / promesasAnterior) * 100 : (promesasActual > 0 ? 100 : 0);
  
  const kpi1 = {
    label: "Promesas Realizadas",
    value: promesasActual,
    change: parseFloat(changePromesas.toFixed(2)),
    color: "#6366f1"
  };

  // KPI 2: Porcentaje de Éxito en Pagos
  const pagadasActual = currentMonthData.filter(d => d.totalPagado > 0).length;
  const porcentajeExitoActual = promesasActual > 0 ? (pagadasActual / promesasActual) * 100 : 0;
  const pagadasAnterior = previousMonthData.filter(d => d.totalPagado > 0).length;
  const porcentajeExitoAnterior = promesasAnterior > 0 ? (pagadasAnterior / promesasAnterior) * 100 : 0;
  const changeExito = porcentajeExitoAnterior > 0 ? ((porcentajeExitoActual - porcentajeExitoAnterior) / porcentajeExitoAnterior) * 100 : (porcentajeExitoActual > 0 ? 100 : 0);
  
  const kpi2 = {
    label: "Promesas Pagadas (%)",
    value: `${porcentajeExitoActual.toFixed(2)}%`,
    change: parseFloat(changeExito.toFixed(2)),
    color: "#22c55e"
  };

  const montoActual = currentMonthData.reduce((sum, d) => sum + d.totalPagado, 0);
  const montoAnterior = previousMonthData.reduce((sum, d) => sum + d.totalPagado, 0);
  const changeMonto = montoAnterior > 0 ? ((montoActual - montoAnterior) / montoAnterior) * 100 : (montoActual > 0 ? 100 : 0);

  const kpi3 = {
    label: "Monto Total Cobrado",
    value: `$${montoActual}`,
    change: parseFloat(changeMonto.toFixed(2)),
    color: "#f97316"
  };

  return [kpi1, kpi2, kpi3];
};