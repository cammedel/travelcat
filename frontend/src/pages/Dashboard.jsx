import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const API_OTS = API_BASE + '/ots';
const API_REPORT = API_BASE + '/reports/dashboard';

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);

const formatPeriodLabel = (periodo) => {
    if (!periodo) return '';
    const [year, month] = periodo.split('-');
    if (!year || !month) return periodo;
    const date = new Date(Number(year), Number(month) - 1, 1);
    if (Number.isNaN(date.getTime())) return periodo;
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

const buildChartData = (entries = {}) =>
    Object.entries(entries).map(([name, value]) => ({ name, value }));

const documentBadgeClass = (estado) => {
    if (estado === 'Vencido') return 'badge text-bg-danger';
    if (estado === 'Por vencer') return 'badge text-bg-warning';
    if (estado === 'Sin fecha') return 'badge text-bg-secondary';
    return 'badge text-bg-success';
};

const maintenanceBadgeClass = (estado) => {
    if (estado === 'Vencido') return 'badge text-bg-danger';
    if (estado === 'Por vencer') return 'badge text-bg-warning';
    return 'badge text-bg-secondary';
};

const priorityBadge = (prioridad) => {
    if (prioridad === 'Alta') return 'badge text-bg-danger';
    if (prioridad === 'Media') return 'badge text-bg-warning';
    return 'badge text-bg-success';
};

function Dashboard() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState(null);
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(true);
    const [reportError, setReportError] = useState(null);

    useEffect(() => {
        if (!token) return;

        setReportLoading(true);
        setReportError(null);

        fetch(API_REPORT, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('No se pudieron obtener los indicadores del dashboard.');
                }
                return res.json();
            })
            .then((data) => {
                setReport(data);
                setReportLoading(false);
            })
            .catch((err) => {
                setReportError(err.message);
                setReportLoading(false);
            });
    }, [token]);

    useEffect(() => {
        if (!token) return;

        setOrdersLoading(true);
        setOrdersError(null);

        fetch(API_OTS, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('No se pudieron obtener las órdenes de trabajo.');
                }
                return res.json();
            })
            .then((data) => {
                setOrders(data);
                setOrdersLoading(false);
            })
            .catch((err) => {
                setOrdersError(err.message);
                setOrdersLoading(false);
            });
    }, [token]);

    const monthlyExpenses = report?.gastos?.mensual ?? [];

    const expenseChartData = useMemo(
        () =>
            monthlyExpenses.map((item) => ({
                name: formatPeriodLabel(item.periodo),
                monto: item.total
            })),
        [monthlyExpenses]
    );

    const maxGasto = useMemo(() => {
        if (expenseChartData.length === 0) return 1;
        return Math.max(...expenseChartData.map((item) => item.monto)) || 1;
    }, [expenseChartData]);

    const estadoData = useMemo(() => buildChartData(report?.ot?.porEstado), [report]);
    const prioridadData = useMemo(() => buildChartData(report?.ot?.porPrioridad), [report]);
    const mantenciones = report?.mantenciones ?? [];

    const presupuesto = report?.gastos?.presupuesto;
    const presupuestoTotal = presupuesto?.presupuestoAnual || 1;
    const presupuestoGastado = report?.gastos?.total || 0;
    const presupuestoRestante = presupuesto?.disponible || 0;
    const presupuestoPorcentaje = Math.min((presupuestoGastado / presupuestoTotal) * 100, 100);

    const pendingOrders = useMemo(
        () => orders.filter((order) => order.estado === 'Pendiente').length,
        [orders]
    );

    const criticalMaintenances = useMemo(
        () => mantenciones.filter((item) => item.estado === 'Vencido').length,
        [mantenciones]
    );

    const todaysDate = new Date().toLocaleDateString();

    return (
        <div className="container page-wrapper">
            <section className="page-hero">
                <h1>Panel de mantenimiento</h1>
                <p>
                    Monitorea tus indicadores de flota, presupuesto y mantención en una vista moderna.
                    Las acciones rápidas te permiten reaccionar a tiempo ante alertas y órdenes pendientes.
                </p>
                <div className="d-flex flex-wrap gap-2">
                    <Link to="/nueva" className="btn btn-primary">
                        Crear nueva OT
                    </Link>
                    <Link to="/gastos" className="btn btn-outline-primary">
                        Revisar gastos
                    </Link>
                </div>
            </section>

            {reportError && (
                <div className="alert alert-warning mb-3" role="alert">
                    {reportError}
                </div>
            )}

            {ordersError && (
                <div className="alert alert-warning mb-3" role="alert">
                    {ordersError}
                </div>
            )}

            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="section-card h-100">
                        <span className="text-muted small">Órdenes activas</span>
                        <h3 className="mt-2 mb-0">{pendingOrders}</h3>
                        <small className="text-muted">Pendientes de atención</small>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="section-card h-100">
                        <span className="text-muted small">Presupuesto disponible</span>
                        <h3 className="mt-2 mb-0">{formatCurrency(presupuestoRestante)}</h3>
                        <small className="text-muted">
                            {presupuesto ? `${presupuestoPorcentaje.toFixed(0)}% utilizado` : 'Sin datos'}
                        </small>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="section-card h-100">
                        <span className="text-muted small">Alertas de mantenimiento</span>
                        <h3 className="mt-2 mb-0">{criticalMaintenances}</h3>
                        <small className="text-muted">Tareas vencidas</small>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="section-card h-100">
                        <span className="text-muted small">Actualizado</span>
                        <h3 className="mt-2 mb-0">{todaysDate}</h3>
                        <small className="text-muted">Datos sincronizados</small>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-xl-7">
                    <div className="section-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="mb-0">Gastos por mes</h5>
                                <small className="text-muted">Maximo: {formatCurrency(maxGasto)}</small>
                            </div>
                        </div>
                        <div style={{ height: 260 }}>
                            {reportLoading ? (
                                <div className="text-center text-muted">Cargando gastos...</div>
                            ) : (
                                <ResponsiveContainer>
                                    <AreaChart data={expenseChartData}>
                                        <defs>
                                            <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.7} />
                                                <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                                        <XAxis dataKey="name" stroke="#6c757d" />
                                        <YAxis stroke="#6c757d" tickFormatter={(value) => (value / 1000000).toFixed(1) + 'M'} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Area type="monotone" dataKey="monto" stroke="#0d6efd" fill="url(#colorGastos)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-xl-5">
                    <div className="section-card h-100">
                        <h5 className="mb-3">Órdenes por estado</h5>
                        {reportLoading ? (
                            <div className="text-muted">Cargando...</div>
                        ) : estadoData.length === 0 ? (
                            <div className="text-muted">Sin registros.</div>
                        ) : (
                            <div style={{ height: 200 }}>
                                <ResponsiveContainer>
                                    <BarChart data={estadoData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Cantidad" fill="#31b0ff" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-xl-6">
                    <div className="section-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Documentación por vencer</h5>
                            <Link to="/reportes" className="btn btn-outline-primary btn-sm">
                                Ver reportes
                            </Link>
                        </div>
                        {reportLoading ? (
                            <div className="text-center text-muted py-4">Cargando documentación...</div>
                        ) : report?.documentacion?.length ? (
                            <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Patente</th>
                                            <th>Documento</th>
                                            <th>Responsable</th>
                                            <th>Vence</th>
                                            <th>Días</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.documentacion.slice(0, 6).map((doc) => (
                                            <tr key={doc.id}>
                                                <td>{doc.patente}</td>
                                                <td>{doc.tipo}</td>
                                                <td>{doc.responsable || 'Sin dato'}</td>
                                                <td>{doc.vence ? new Date(doc.vence).toLocaleDateString() : 'Sin fecha'}</td>
                                                <td>{doc.diasParaVencer ?? 'Sin dato'}</td>
                                                <td>
                                                    <span className={documentBadgeClass(doc.estado)}>{doc.estado}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-muted py-4">Sin documentación registrada.</div>
                        )}
                    </div>
                </div>
                <div className="col-xl-6">
                    <div className="section-card h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Alertas de mantenimiento</h5>
                            <Link to="/mantencion" className="btn btn-outline-primary btn-sm">
                                Ver programas
                            </Link>
                        </div>
                        {reportLoading ? (
                            <div className="text-center text-muted py-4">Cargando alertas...</div>
                        ) : mantenciones.length === 0 ? (
                            <div className="text-center text-muted py-4">No hay alertas registradas.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Tarea</th>
                                            <th>Patente</th>
                                            <th>Tipo</th>
                                            <th>Próximo control</th>
                                            <th>Días</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mantenciones.slice(0, 6).map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.tarea}</td>
                                                <td>{item.patente}</td>
                                                <td>{item.tipoControl === 'km' ? 'Kilómetros' : 'Fecha'}</td>
                                                <td>{item.proximoControl || '—'}</td>
                                                <td>{item.dias ?? '—'}</td>
                                                <td>
                                                    <span className={maintenanceBadgeClass(item.estado)}>{item.estado}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="section-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Órdenes de trabajo ({orders.length})</h5>
                    <Link to="/nueva" className="btn btn-outline-primary btn-sm">
                        Gestionar órdenes
                    </Link>
                </div>
                {ordersLoading ? (
                    <div className="text-center text-muted py-4">Cargando órdenes de trabajo...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-muted py-4">Aún no existen órdenes registradas.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Título</th>
                                    <th>Patente</th>
                                    <th>Prioridad</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 6).map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <div className="fw-semibold">{order.titulo}</div>
                                            <div className="text-muted small">{order.mecanico}</div>
                                        </td>
                                        <td>{order.patente}</td>
                                        <td>
                                            <span className={priorityBadge(order.prioridad)}>{order.prioridad}</span>
                                        </td>
                                        <td>{order.estado}</td>
                                        <td>{order.fechaSolicitud ? new Date(order.fechaSolicitud).toLocaleDateString() : 'Sin fecha'}</td>
                                        <td>{formatCurrency(order.totalCosto)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
