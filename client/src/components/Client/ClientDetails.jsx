import { useEffect, useState } from "react";
import { fetchClientTimeline } from "../../services/api";
import Timeline from "./Timeline";
import DebtPanel from "./DebtPanel";
import moment from "moment";
import { Calendar, DollarSign } from "lucide-react";

const ClientDetails = ({ clientId }) => {
    console.log("ClientDetails received clientId:", clientId);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClient();
    }, [clientId]);

    const fetchClient = async () => {
        setLoading(true);
        try {
            const response = await fetchClientTimeline(clientId);
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching client details:', error);
        }
    };

    if (loading) {
        return (
            <div className="lg:col-span-2 p-12 text-center bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-500">Cargando detalles del cliente...</p>
            </div>
        );
    }
    if (!clientId || !data) {
        return (
            <div className="lg:col-span-2 p-12 text-center bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-500">Selecciona un cliente para ver los detalles.</p>
            </div>
        );
    }




    const { cliente, deuda_actual, eventos } = data;

    const calcularPagoPrometido = (eventos) => {
        let totalPrometido = 0;

        const pagos = eventos.filter(evento =>
            evento.monto !== null && evento.monto > 0
        );

        pagos.forEach(pago => {
            totalPrometido += pago.monto;
        });

        return totalPrometido;
    };

    return (
        <div className="lg:col-span-2">
            <div className="space-y-6">
                {/* Panel de detalles generales del cliente */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Detalles de {cliente.nombre}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            <p className="font-medium text-gray-900">{cliente?.telefono || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Deuda Actual</p>
                            <div className="flex items-center font-medium text-gray-900">
                                <DollarSign className="w-4 h-4 mr-1 text-gray-600" />
                                {cliente?.total_deuda_actual ? `$${cliente.total_deuda_actual.toLocaleString()}` : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Último Contacto</p>
                            <div className="flex items-center font-medium text-gray-900">
                                <Calendar className="w-4 h-4 mr-1 text-gray-600" />
                                {cliente?.fecha_ultimo_contacto ? moment(cliente.fecha_ultimo_contacto).format('DD/MM/YYYY') : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Componente de la línea de tiempo */}
                    <div className="lg:col-span-2">
                        <Timeline eventos={eventos} />
                    </div>
                    {/* Componente del panel de deuda */}
                    <div className="lg:col-span-1">
                        <DebtPanel montoPrometido={calcularPagoPrometido(eventos)} deudaActual={deuda_actual} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClientDetails;
