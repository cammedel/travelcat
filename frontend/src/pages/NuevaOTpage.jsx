import { useCallback, useEffect, useMemo, useState } from 'react';
import NuevaOTForm from '../components/NuevaOTForm';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const API_OTS = API_BASE + '/ots';
const API_PROVIDERS = API_BASE + '/providers';
const API_TRUCKS = API_BASE + '/trucks';
const API_REFERENCE = API_BASE + '/reference';
const ORDER_STATES = ['Pendiente', 'En progreso', 'Finalizada', 'Rechazada'];

const emptyOrder = {
    titulo: '',
    patente: '',
    mecanico: '',
    proveedorId: '',
    prioridad: 'Media',
    descripcion: '',
    fechaSolicitud: new Date().toISOString().slice(0, 10),
    conductor: '',
    repuestos: []
};

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);

const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString();
};

const prioridadBadge = (prioridad) => {
    if (prioridad === 'Alta') return 'badge text-bg-danger';
    if (prioridad === 'Media') return 'badge text-bg-warning';
    return 'badge text-bg-success';
};

function NuevaOTPage() {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [providers, setProviders] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [formData, setFormData] = useState(emptyOrder);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [estadoFiltro, setEstadoFiltro] = useState('todos');
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null);
    const [generandoBudgetId, setGenerandoBudgetId] = useState(null);

    const ayuda = useMemo(
        () => [
            'Completa los datos principales de la orden antes de guardarla.',
            'Agrega los repuestos con cantidad y costo para calcular el total estimado.',
            'Gestiona el estado y el presupuesto desde la lista de ordenes.'
        ],
        []
    );

    const authHeaders = useMemo(
        () => ({
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        [token]
    );

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_OTS, { headers: { Authorization: 'Bearer ' + token } });

            if (!response.ok) {
                throw new Error('No se pudo obtener el listado de ordenes de trabajo.');
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const fetchCatalogs = useCallback(async () => {
        if (!token) return;

        try {
            const [provRes, truckRes, refRes] = await Promise.all([
                fetch(API_PROVIDERS, { headers: { Authorization: 'Bearer ' + token } }),
                fetch(API_TRUCKS, { headers: { Authorization: 'Bearer ' + token } }),
                fetch(API_REFERENCE + '/catalogos', { headers: { Authorization: 'Bearer ' + token } })
            ]);

            if (!provRes.ok || !truckRes.ok || !refRes.ok) {
                throw new Error('No se pudieron cargar los catalogos requeridos.');
            }

            const [provData, truckData, refData] = await Promise.all([
                provRes.json(),
                truckRes.json(),
                refRes.json()
            ]);

            setProviders(provData);
            setTrucks(truckData);
            setDrivers(refData.conductores || []);
        } catch (catalogError) {
            console.error(catalogError);
        }
    }, [token]);

    useEffect(() => {
        fetchOrders();
        fetchCatalogs();
    }, [fetchOrders, fetchCatalogs]);

    const handleFieldChange = (name, rawValue) => {
        let value = rawValue;

        if (typeof rawValue === 'string') {
            switch (name) {
                case 'patente':
                    value = rawValue.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 10);
                    break;
                case 'titulo':
                    value = rawValue.replace(/[^\p{L}0-9\s.,-]/gu, '').replace(/^\s+/u, '').slice(0, 120);
                    break;
                case 'mecanico':
                case 'conductor':
                    value = rawValue.replace(/[^\p{L}\s]/gu, '').replace(/\s{2,}/g, ' ').replace(/^\s+/u, '').slice(0, 60);
                    break;
                case 'descripcion':
                    value = rawValue.replace(/[^\p{L}0-9\s.,-]/gu, '').replace(/^\s+/u, '').slice(0, 400);
                    break;
                default:
                    break;
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddRepuesto = () => {
        setFormData((prev) => ({
            ...prev,
            repuestos: [...prev.repuestos, { nombre: '', cantidad: 1, costo: 0 }]
        }));
    };

    const handleRepuestoChange = (index, field, rawValue) => {
        let value = rawValue;

        if (typeof rawValue === 'string') {
            if (field === 'cantidad' || field === 'costo') {
                value = rawValue.replace(/[^0-9]/g, '').slice(0, 9);
            } else if (field === 'nombre') {
                value = rawValue.replace(/[^\p{L}0-9\s.,-]/gu, '').replace(/^\s+/u, '').slice(0, 80);
            }
        }

        setFormData((prev) => ({
            ...prev,
            repuestos: prev.repuestos.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleRemoveRepuesto = (index) => {
        setFormData((prev) => ({
            ...prev,
            repuestos: prev.repuestos.filter((_, idx) => idx !== index)
        }));
    };

    const resetForm = () => {
        setFormData({
            ...emptyOrder,
            fechaSolicitud: new Date().toISOString().slice(0, 10)
        });
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setActionMessage(null);

        const method = editingId ? 'PUT' : 'POST';
        const endpoint = editingId ? `${API_OTS}/${editingId}` : API_OTS;

        const payload = {
            ...formData,
            proveedorId: formData.proveedorId ? Number(formData.proveedorId) : null
        };

        try {
            const response = await fetch(endpoint, {
                method,
                headers: authHeaders,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'No se pudo guardar la orden de trabajo.');
            }

            await fetchOrders();
            setActionMessage(editingId ? 'Orden actualizada correctamente.' : 'Orden creada correctamente.');
            resetForm();
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (order) => {
        setEditingId(order.id);
        setFormData({
            titulo: order.titulo,
            patente: order.patente,
            mecanico: order.mecanico,
            proveedorId: String(order.proveedorId || ''),
            prioridad: order.prioridad,
            descripcion: order.descripcion,
            fechaSolicitud: order.fechaSolicitud || new Date().toISOString().slice(0, 10),
            conductor: order.conductor || '',
            repuestos: Array.isArray(order.repuestos)
                ? order.repuestos.map((item) => ({
                      nombre: item.nombre,
                      cantidad: item.cantidad,
                      costo: item.costo
                  }))
                : []
        });
        setExpandedOrderId(order.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (order) => {
        if (!window.confirm(`Eliminar la orden "${order.titulo}"?`)) return;

        try {
            const response = await fetch(`${API_OTS}/${order.id}`, {
                method: 'DELETE',
                headers: { Authorization: 'Bearer ' + token }
            });

            if (!response.ok) {
                throw new Error('No se pudo eliminar la orden.');
            }

            setOrders((prev) => prev.filter((item) => item.id !== order.id));
            if (editingId === order.id) {
                resetForm();
            }
            if (expandedOrderId === order.id) {
                setExpandedOrderId(null);
            }
            setActionMessage('Orden eliminada.');
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const handlePrint = (order) => {
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) return;

        const repuestos = Array.isArray(order.repuestos) ? order.repuestos : [];
        const rows = repuestos
            .map(
                (item) =>
                    `<tr><td>${item.nombre}</td><td>${item.cantidad}</td><td>${formatCurrency(item.costo)}</td><td>${formatCurrency(
                        (Number(item.cantidad) || 0) * (Number(item.costo) || 0)
                    )}</td></tr>`
            )
            .join('');

        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Orden de trabajo #${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem; }
    h1 { margin-bottom: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Orden de trabajo #${order.id}</h1>
  <p><strong>Titulo:</strong> ${order.titulo}</p>
  <p><strong>Patente:</strong> ${order.patente}</p>
  <p><strong>Proveedor:</strong> ${order.proveedorId}</p>
  <p><strong>Mecanico:</strong> ${order.mecanico}</p>
  <p><strong>Conductor:</strong> ${order.conductor || 'Sin asignar'}</p>
  <p><strong>Fecha solicitud:</strong> ${formatDate(order.fechaSolicitud)}</p>
  <p><strong>Estado:</strong> ${order.estado} | <strong>Prioridad:</strong> ${order.prioridad}</p>
  <p><strong>Total estimado:</strong> ${formatCurrency(order.totalCosto)}</p>
  <h2>Descripcion</h2>
  <p>${order.descripcion || 'Sin descripcion.'}</p>
  <h2>Repuestos</h2>
  <table>
    <thead>
      <tr><th>Nombre</th><th>Cantidad</th><th>Costo unitario</th><th>Subtotal</th></tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="4">Sin repuestos asociados.</td></tr>'}</tbody>
  </table>
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleEstadoChange = async (orderId, estado) => {
        setCambiandoEstadoId(orderId);
        setError(null);
        setActionMessage(null);

        try {
            const response = await fetch(`${API_OTS}/${orderId}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ estado })
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'No se pudo actualizar el estado de la orden.');
            }

            const updatedOrder = await response.json();
            setOrders((prev) => prev.map((item) => (item.id === orderId ? updatedOrder : item)));
            setActionMessage(`Estado actualizado a ${updatedOrder.estado}.`);
        } catch (stateError) {
            setError(stateError.message);
        } finally {
            setCambiandoEstadoId(null);
        }
    };

    const handleGenerateBudget = async (orderId) => {
        setGenerandoBudgetId(orderId);
        setError(null);
        setActionMessage(null);

        try {
            const response = await fetch(`${API_OTS}/${orderId}/budget`, {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + token }
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'No se pudo generar el presupuesto.');
            }

            await response.json();
            setActionMessage('Presupuesto enviado a revision para gastos.');
        } catch (budgetError) {
            setError(budgetError.message);
        } finally {
            setGenerandoBudgetId(null);
        }
    };

    const toggleDetalles = (orderId) => {
        setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    };

    const providerMap = useMemo(() => {
        const map = new Map();
        providers.forEach((provider) => {
            map.set(provider.id, provider);
        });
        return map;
    }, [providers]);

    const estadoOptions = useMemo(() => {
        const set = new Set(ORDER_STATES);
        orders.forEach((order) => {
            if (order.estado) {
                set.add(order.estado);
            }
        });
        return Array.from(set);
    }, [orders]);

    const secciones = useMemo(() => {
        const sortByDate = (list) =>
            [...list].sort((a, b) => {
                const fechaA = a.fechaSolicitud ? new Date(a.fechaSolicitud).getTime() : 0;
                const fechaB = b.fechaSolicitud ? new Date(b.fechaSolicitud).getTime() : 0;
                return fechaB - fechaA;
            });

        const sections = ORDER_STATES.map((estado) => [
            estado,
            sortByDate(orders.filter((order) => order.estado === estado))
        ]);

        const otros = orders.filter((order) => !ORDER_STATES.includes(order.estado));
        if (otros.length) {
            sections.push(['Otros', sortByDate(otros)]);
        }

        return sections;
    }, [orders]);

    const filtrosEstados = useMemo(() => {
        const base = ['todos', ...ORDER_STATES];
        if (secciones.some(([label]) => label === 'Otros')) {
            base.push('Otros');
        }
        return base;
    }, [secciones]);

    const seccionesVisibles = useMemo(
        () => secciones.filter(([label]) => (estadoFiltro === 'todos' ? true : label === estadoFiltro)),
        [secciones, estadoFiltro]
    );

    return (
        <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Ordenes de trabajo</h1>
                    <p className="text-muted mb-0">Registra y controla las ordenes con sus presupuestos asociados.</p>
                </div>
                <button className="btn btn-outline-secondary" onClick={fetchOrders} disabled={loading}>
                    {loading ? 'Actualizando...' : 'Refrescar lista'}
                </button>
            </div>

            <div className="help-callout mb-4">
                <strong>Ayuda rapida</strong>
                <ul className="mb-0">
                    {ayuda.map((tip) => (
                        <li key={tip}>{tip}</li>
                    ))}
                </ul>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {actionMessage && (
                <div className="alert alert-success" role="alert">
                    {actionMessage}
                </div>
            )}

            <div className="row g-4">
                <div className="col-lg-5">
                    <NuevaOTForm
                        formData={formData}
                        providers={providers}
                        trucks={trucks}
                        drivers={drivers}
                        onFieldChange={handleFieldChange}
                        onRepuestoChange={handleRepuestoChange}
                        onAddRepuesto={handleAddRepuesto}
                        onRemoveRepuesto={handleRemoveRepuesto}
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                        saving={saving}
                        editing={Boolean(editingId)}
                    />
                </div>

                <div className="col-lg-7">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-0">Listado de ordenes ({orders.length})</h5>
                                    <small className="text-muted">Separadas por estado actual</small>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center text-muted">Cargando ordenes de trabajo...</div>
                            ) : orders.length === 0 ? (
                                <div className="text-center text-muted">Aun no existen ordenes registradas.</div>
                            ) : (
                                <>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {filtrosEstados.map((filtro) => (
                                            <button
                                                key={filtro}
                                                type="button"
                                                className={`btn btn-sm ${estadoFiltro === filtro ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setEstadoFiltro(filtro)}
                                            >
                                                {filtro === 'todos' ? 'Todos' : filtro}
                                            </button>
                                        ))}
                                    </div>

                                    {seccionesVisibles.map(([estado, items]) => (
                                        <section key={estado} className="mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">Ordenes {estado.toLowerCase()}</h6>
                                                <span className="badge text-bg-light">{items.length}</span>
                                            </div>
                                            {items.length === 0 ? (
                                                <div className="border rounded p-3 text-muted small">No hay ordenes en este estado.</div>
                                            ) : (
                                                items.map((order) => {
                                                    const repuestos = Array.isArray(order.repuestos) ? order.repuestos : [];
                                                    const proveedor = providerMap.get(order.proveedorId);
                                                    return (
                                                        <div key={order.id} className="border rounded p-3 mb-3">
                                                            <div className="d-flex justify-content-between align-items-start gap-3">
                                                                <div>
                                                                    <h6 className="mb-1">{order.titulo}</h6>
                                                                    <div className="text-muted small">Mecanico: {order.mecanico}</div>
                                                                    <div className="text-muted small">
                                                                        Proveedor: {proveedor?.empresa || 'Sin proveedor'}
                                                                    </div>
                                                                    <div className="text-muted small">
                                                                        Conductor: {order.conductor || 'Sin asignar'}
                                                                    </div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <span className="badge text-bg-dark d-inline-block mb-1">{order.patente}</span>
                                                                    <div className="text-muted small">{formatDate(order.fechaSolicitud)}</div>
                                                                    <div className="text-muted small">
                                                                        Prioridad: <span className={prioridadBadge(order.prioridad)}>{order.prioridad}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="row g-3 align-items-end mt-3">
                                                                <div className="col-sm-4 col-md-3 col-lg-4">
                                                                    <label className="form-label small mb-1">Estado</label>
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={order.estado || 'Pendiente'}
                                                                        onChange={(event) => handleEstadoChange(order.id, event.target.value)}
                                                                        disabled={cambiandoEstadoId === order.id}
                                                                    >
                                                                        {estadoOptions.map((option) => (
                                                                            <option key={option} value={option}>
                                                                                {option}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="col-sm-4 col-md-3 col-lg-4">
                                                                    <div className="text-muted small">Total estimado</div>
                                                                    <strong>{formatCurrency(order.totalCosto)}</strong>
                                                                </div>
                                                                <div className="col-12 col-md">
                                                                    <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-primary btn-sm"
                                                                            onClick={() => toggleDetalles(order.id)}
                                                                        >
                                                                            {expandedOrderId === order.id ? 'Ocultar detalle' : 'Ver detalle'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-success btn-sm"
                                                                            onClick={() => handleGenerateBudget(order.id)}
                                                                            disabled={generandoBudgetId === order.id}
                                                                        >
                                                                            {generandoBudgetId === order.id ? 'Generando...' : 'Generar presupuesto'}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary btn-sm"
                                                                            onClick={() => handleEdit(order)}
                                                                        >
                                                                            Editar
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary btn-sm"
                                                                            onClick={() => handlePrint(order)}
                                                                        >
                                                                            Imprimir
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            onClick={() => handleDelete(order)}
                                                                        >
                                                                            Eliminar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {expandedOrderId === order.id && (
                                                                <div className="mt-3 border-top pt-3">
                                                                    <p className="mb-2">{order.descripcion || 'Sin descripcion.'}</p>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm align-middle">
                                                                            <thead className="table-light">
                                                                                <tr>
                                                                                    <th>Repuesto</th>
                                                                                    <th>Cantidad</th>
                                                                                    <th>Costo unitario</th>
                                                                                    <th>Total</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {repuestos.length === 0 ? (
                                                                                    <tr>
                                                                                        <td colSpan="4" className="text-muted">Sin repuestos registrados.</td>
                                                                                    </tr>
                                                                                ) : (
                                                                                    repuestos.map((item, index) => (
                                                                                        <tr key={`${order.id}-item-${index}`}>
                                                                                            <td>{item.nombre}</td>
                                                                                            <td>{item.cantidad}</td>
                                                                                            <td>{formatCurrency(item.costo)}</td>
                                                                                            <td>{formatCurrency((Number(item.costo) || 0) * (Number(item.cantidad) || 0))}</td>
                                                                                        </tr>
                                                                                    ))
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </section>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NuevaOTPage;
