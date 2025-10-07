import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import travelLogo from '../assets/travel.jpg';
import './Gastos.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const API_EXPENSES = API_BASE + '/expenses';
const API_BUDGETS = API_BASE + '/budgets';
const API_PROVIDERS = API_BASE + '/providers';

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);

const toIsoWeekString = (value) => {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return null;

    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
    return `${utcDate.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};

const emptyForm = {
    patente: '',
    concepto: '',
    costo: '',
    fecha: new Date().toISOString().slice(0, 10),
    boleta: null,
    proveedorId: ''
};

function Gastos() {
    const { token } = useAuth();
    const [gastos, setGastos] = useState([]);
    const [presupuesto, setPresupuesto] = useState(null);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [budgetInput, setBudgetInput] = useState('');
    const [budgetStatus, setBudgetStatus] = useState(null);
    const [updatingBudget, setUpdatingBudget] = useState(false);
    const [budgets, setBudgets] = useState([]);
    const [budgetEdits, setBudgetEdits] = useState({});
    const [budgetSavingId, setBudgetSavingId] = useState(null);
    const [budgetAlert, setBudgetAlert] = useState(null);
    const [budgetFilter, setBudgetFilter] = useState('Pendiente');
    const [budgetProviderFilter, setBudgetProviderFilter] = useState('');
    const [providersList, setProvidersList] = useState([]);
    const [providersMap, setProvidersMap] = useState(new Map());
    const [filterType, setFilterType] = useState('todos');
    const [filterValue, setFilterValue] = useState('');

    const authHeaders = useMemo(
        () => ({
            Authorization: 'Bearer ' + token
        }),
        [token]
    );

    const jsonHeaders = useMemo(
        () => ({
            ...authHeaders,
            'Content-Type': 'application/json'
        }),
        [authHeaders]
    );

    const filteredGastos = useMemo(() => {
        if (!Array.isArray(gastos)) return [];

        if (filterType === 'todos' || !filterValue) {
            return gastos;
        }

        return gastos.filter((gasto) => {
            const fecha = typeof gasto.fecha === 'string' ? gasto.fecha : '';
            if (!fecha) return false;

            const isoMes = fecha.slice(0, 7);
            const isoAnio = fecha.slice(0, 4);
            const isoSemana = toIsoWeekString(fecha);

            switch (filterType) {
                case 'mes':
                    return isoMes === filterValue;
                case 'anio':
                    return isoAnio === filterValue;
                case 'semana':
                    return isoSemana === filterValue;
                default:
                    return true;
            }
        });
    }, [gastos, filterType, filterValue]);

    const totalGastado = useMemo(
        () => gastos.reduce((acc, item) => acc + (item.costo || 0), 0),
        [gastos]
    );

    const totalFiltrado = useMemo(
        () => filteredGastos.reduce((acc, item) => acc + (item.costo || 0), 0),
        [filteredGastos]
    );

    const budgetStats = useMemo(() => {
        const stats = { total: budgets.length };
        budgets.forEach((budget) => {
            stats[budget.estado] = (stats[budget.estado] || 0) + 1;
        });
        return stats;
    }, [budgets]);

    const filteredBudgets = useMemo(() => {
        let list = Array.isArray(budgets) ? budgets : [];

        if (budgetFilter !== 'todos') {
            list = list.filter((budget) => budget.estado === budgetFilter);
        }

        if (!budgetProviderFilter.trim()) {
            return list;
        }

        const term = budgetProviderFilter.trim().toLowerCase();
        return list.filter((budget) => {
            const provider = providersMap.get(String(budget.order?.proveedorId));
            const providerName = provider?.empresa || provider?.razonSocial || '';
            return providerName.toLowerCase().includes(term);
        });
    }, [budgets, budgetFilter, budgetProviderFilter, providersMap]);

    const presupuestoAnual = presupuesto?.presupuestoAnual ?? 0;
    const presupuestoGastado = presupuesto?.gastado ?? 0;
    const presupuestoDisponible = presupuesto?.disponible ?? 0;
    const presupuestoProgress = presupuestoAnual > 0 ? Math.min((presupuestoGastado / presupuestoAnual) * 100, 100) : 0;
    const pendingBudgets = budgetStats['Pendiente'] || 0;
    const approvedBudgets = budgetStats['Aprobado'] || 0;
    const partialBudgets = budgetStats['Parcial'] || 0;
    const rejectedBudgets = budgetStats['Rechazado'] || 0;
    const presupuestoProgressLabel = Math.round(presupuestoProgress);
    const filteredTotalValue = filterType === 'todos' ? totalGastado : totalFiltrado;
    const hasBudgetData = Boolean(presupuesto);
    const filterSummaryDescription = (() => {
        if (filterType === 'todos') {
            return 'Mostrando todos los gastos registrados.';
        }
        if (!filterValue) {
            return 'Selecciona un valor para completar el filtro.';
        }
        if (filterType === 'mes') {
            return `${filteredGastos.length} resultados para el mes ${filterValue}.`;
        }
        if (filterType === 'anio') {
            return `${filteredGastos.length} resultados para el anio ${filterValue}.`;
        }
        if (filterType === 'semana') {
            return `${filteredGastos.length} resultados para la semana ${filterValue}.`;
        }
        return `${filteredGastos.length} resultados filtrados.`;
    })();

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        setBudgetAlert(null);

        try {
            const [expensesResponse, budgetsResponse, providersResponse] = await Promise.all([
                fetch(API_EXPENSES, { headers: authHeaders }),
                fetch(API_BUDGETS, { headers: authHeaders }),
                fetch(API_PROVIDERS, { headers: authHeaders })
            ]);

            if (!expensesResponse.ok || !budgetsResponse.ok || !providersResponse.ok) {
                throw new Error('No se pudo obtener la informacion de gastos, presupuestos y proveedores.');
            }

            const [expensesData, budgetsData, providersData] = await Promise.all([
                expensesResponse.json(),
                budgetsResponse.json(),
                providersResponse.json()
            ]);

            setGastos(expensesData.gastos || []);
            setPresupuesto(expensesData.presupuesto || null);
            setBudgetInput(expensesData.presupuesto?.presupuestoAnual ? String(expensesData.presupuesto.presupuestoAnual) : '');
            setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
            setBudgetEdits({});
            const providerEntries = Array.isArray(providersData)
                ? providersData.map((provider) => [
                    String(provider.id),
                    provider
                ])
                : [];
            setProvidersList(Array.isArray(providersData) ? providersData : []);
            setProvidersMap(new Map(providerEntries));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (message) setMessage(null);

        if (name === 'costo') {
            const numeric = value.replace(/[^0-9]/g, '');
            setFormData((prev) => ({ ...prev, costo: numeric }));
            return;
        }

        if (name === 'patente') {
            const sanitized = value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 10);
            setFormData((prev) => ({ ...prev, patente: sanitized }));
            return;
        }

        if (name === 'concepto') {
            const sanitized = value.replace(/[^\p{L}0-9\s.,-]/gu, '').slice(0, 120);
            setFormData((prev) => ({ ...prev, concepto: sanitized }));
            return;
        }

        if (name === 'proveedorId') {
            setFormData((prev) => ({ ...prev, proveedorId: value }));
            return;
        }

        if (name === 'boleta') {
            const file = event.target.files?.[0] || null;
            setFormData((prev) => ({ ...prev, boleta: file }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBudgetChange = (event) => {
        const numeric = event.target.value.replace(/[^0-9]/g, '');
        setBudgetInput(numeric);
        if (budgetStatus) {
            setBudgetStatus(null);
        }
    };

    const handleFilterTypeChange = (event) => {
        setFilterType(event.target.value);
        setFilterValue('');
    };

    const handleFilterValueChange = (event) => {
        setFilterValue(event.target.value);
    };

    const handleFiltersReset = () => {
        setFilterType('todos');
        setFilterValue('');
    };

    const handleBudgetProviderFilterChange = (event) => {
        setBudgetProviderFilter(event.target.value);
    };

    const handleBudgetSubmit = async (event) => {
        event.preventDefault();

        if (!token) return;

        const monto = Number(budgetInput);

        if (!budgetInput.trim() || !Number.isFinite(monto) || monto <= 0) {
            setBudgetStatus({ type: 'warning', text: 'Ingresa un monto valido mayor a cero.' });
            return;
        }

        setUpdatingBudget(true);
        setBudgetStatus(null);

        try {
            const response = await fetch(`${API_EXPENSES}/budget`, {
                method: 'PUT',
                headers: jsonHeaders,
                body: JSON.stringify({ presupuestoAnual: monto })
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'No se pudo actualizar el presupuesto.');
            }

            const data = await response.json();
            setPresupuesto(data);
            setBudgetInput(String(data.presupuestoAnual));
            setBudgetStatus({ type: 'success', text: 'Presupuesto actualizado correctamente.' });
        } catch (updateError) {
            setBudgetStatus({ type: 'danger', text: updateError.message });
        } finally {
            setUpdatingBudget(false);
        }
    };

    const handleBudgetFieldChange = (budgetId, field, value) => {
        setBudgetEdits((prev) => ({
            ...prev,
            [budgetId]: {
                ...prev[budgetId],
                [field]: value
            }
        }));
    };

    const handleBudgetSave = async (budgetId) => {
        const currentEdit = budgetEdits[budgetId] || {};
        const original = budgets.find((item) => item.id === budgetId);

        if (!original) return;

        const payload = {};
        if (currentEdit.estado && currentEdit.estado !== original.estado) {
            payload.estado = currentEdit.estado;
        }
        if (currentEdit.observacion !== undefined && currentEdit.observacion !== original.observacion) {
            payload.observacion = currentEdit.observacion;
        }
        if (currentEdit.monto !== undefined && Number.isFinite(Number(currentEdit.monto)) && Number(currentEdit.monto) !== original.monto) {
            payload.monto = Number(currentEdit.monto);
        }

        if (Object.keys(payload).length === 0) {
            setBudgetAlert({ type: 'info', text: 'No hay cambios para guardar.' });
            return;
        }

        setBudgetSavingId(budgetId);
        setBudgetAlert(null);

        try {
            const response = await fetch(`${API_BUDGETS}/${budgetId}`, {
                method: 'PUT',
                headers: jsonHeaders,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'No se pudo actualizar el presupuesto.');
            }

            const updated = await response.json();
            setBudgets((prev) => prev.map((item) => (item.id === budgetId ? updated : item)));
            setBudgetEdits((prev) => {
                const next = { ...prev };
                delete next[budgetId];
                return next;
            });
            setBudgetAlert({ type: 'success', text: `Presupuesto actualizado a ${updated.estado}.` });
        } catch (updateError) {
            setBudgetAlert({ type: 'danger', text: updateError.message });
        } finally {
            setBudgetSavingId(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!token) return;

        if (!formData.patente.trim() || !formData.concepto.trim() || !formData.costo) {
            setMessage({ type: 'warning', text: 'Complete patente, concepto y costo.' });
            return;
        }

        setSaving(true);
        setError(null);

        const payload = new FormData();
        payload.append('patente', formData.patente.trim().toUpperCase());
        payload.append('concepto', formData.concepto);
        payload.append('costo', Number(formData.costo));
        payload.append('fecha', formData.fecha);
        if (formData.proveedorId) {
            payload.append('proveedorId', formData.proveedorId);
        }
        if (formData.boleta) {
            payload.append('boleta', formData.boleta);
        }

        try {
            const response = await fetch(API_EXPENSES, {
                method: 'POST',
                headers: authHeaders,
                body: payload
            });

            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.error || 'No se pudo registrar el gasto.');
            }

            setMessage({ type: 'success', text: 'Gasto registrado correctamente.' });
            setFormData({ ...emptyForm, fecha: new Date().toISOString().slice(0, 10) });
            await fetchData();
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper gastos-page">
            <div className="container">
                <section className="page-hero gastos-hero">
                    <div className="gastos-hero__content">
                        <span className="gastos-hero__eyebrow">Travel</span>
                        <h1>Panel de gastos</h1>
                        <p>
                            Controla los movimientos de repuestos, administra presupuestos y mantienes a tus proveedores alineados con el plan anual.
                        </p>
                        <div className="gastos-hero__actions">
                            <button
                                type="button"
                                className="btn btn-light btn-sm"
                                onClick={fetchData}
                                disabled={loading}
                            >
                                {loading ? 'Actualizando...' : 'Refrescar datos'}
                            </button>
                            <Link className="btn btn-outline-light btn-sm" to="/proveedores">
                                Administrar proveedores
                            </Link>
                        </div>
                    </div>
                    <div className="gastos-hero__visual">
                        <div className="gastos-hero__logo-wrap">
                            <img src={travelLogo} alt="Logo de Travel" className="gastos-hero__logo" />
                        </div>
                        <div className="gastos-hero__snapshot">
                            <span className="gastos-hero__snapshot-label">Gastado a la fecha</span>
                            <strong>{formatCurrency(totalGastado)}</strong>
                            {hasBudgetData ? (
                                <>
                                    <div className="gastos-hero__snapshot-inline">
                                        <span>Presupuesto anual</span>
                                        <span>{formatCurrency(presupuestoAnual)}</span>
                                    </div>
                                    <div className="gastos-hero__snapshot-inline">
                                        <span>Disponible</span>
                                        <span>{formatCurrency(presupuestoDisponible)}</span>
                                    </div>
                                    <div
                                        className="progress gastos-hero__progress"
                                        role="progressbar"
                                        aria-valuenow={presupuestoProgressLabel}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div className="progress-bar bg-success" style={{ width: `${presupuestoProgressLabel}%` }} />
                                    </div>
                                    <small className="text-muted">Uso del presupuesto {presupuestoProgressLabel}%</small>
                                </>
                            ) : (
                                <small className="text-muted">Configura un presupuesto para ver el detalle.</small>
                            )}
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="alert alert-danger gastos-page__alert" role="alert">
                        {error}
                    </div>
                )}

                <div className="row g-3 gastos-summary">
                    <div className="col-12 col-md-4">
                        <div className="gastos-summary__card is-primary">
                            <span className="gastos-summary__label">Total general</span>
                            <h3>{formatCurrency(totalGastado)}</h3>
                            <span className="gastos-summary__meta">{gastos.length} movimientos registrados</span>
                            {hasBudgetData && (
                                <span className="gastos-summary__helper">Disponible {formatCurrency(presupuestoDisponible)}</span>
                            )}
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="gastos-summary__card">
                            <span className="gastos-summary__label">Filtro actual</span>
                            <h3>{formatCurrency(filteredTotalValue)}</h3>
                            <span className="gastos-summary__meta">{filterSummaryDescription}</span>
                            {filterType !== 'todos' && (
                                <button
                                    type="button"
                                    className="btn btn-link btn-sm px-0 gastos-summary__reset"
                                    onClick={handleFiltersReset}
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="gastos-summary__card is-accent">
                            <span className="gastos-summary__label">Presupuestos</span>
                            <h3>{pendingBudgets} pendientes</h3>
                            <div className="gastos-summary__meta-grid">
                                <span>Aprobados: {approvedBudgets}</span>
                                <span>Parciales: {partialBudgets}</span>
                                <span>Rechazados: {rejectedBudgets}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="gastos-layout">
                    <div className="gastos-column gastos-column--primary">
                        <section className="section-card gastos-panel">
                            <header className="gastos-panel__header">
                                <div>
                                    <h2>Registrar gasto</h2>
                                    <p className="text-muted mb-0">Ingresa los costos de repuestos asociados a tu flota.</p>
                                </div>
                            </header>
                            {message && (
                                <div className={`alert alert-${message.type}`} role="alert">
                                    {message.text}
                                </div>
                            )}
                            <form className="gastos-form" onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Patente</label>
                                        <input
                                            name="patente"
                                            value={formData.patente}
                                            onChange={handleChange}
                                            className="form-control"
                                            maxLength={10}
                                            placeholder="AA-BB11"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Proveedor</label>
                                        <select
                                            name="proveedorId"
                                            value={formData.proveedorId}
                                            onChange={handleChange}
                                            className="form-select"
                                        >
                                            <option value="">Sin proveedor</option>
                                            {providersList.map((provider) => (
                                                <option key={provider.id} value={provider.id}>
                                                    {provider.empresa || provider.razonSocial}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Concepto</label>
                                        <input
                                            name="concepto"
                                            value={formData.concepto}
                                            onChange={handleChange}
                                            className="form-control"
                                            maxLength={120}
                                            placeholder="Ej. Cambio de neumaticos"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Costo (CLP)</label>
                                        <input
                                            name="costo"
                                            value={formData.costo}
                                            onChange={handleChange}
                                            className="form-control"
                                            maxLength={9}
                                            inputMode="numeric"
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Fecha</label>
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={formData.fecha}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Adjuntar boleta (opcional)</label>
                                        <input
                                            type="file"
                                            name="boleta"
                                            className="form-control"
                                            accept="application/pdf,image/*"
                                            onChange={handleChange}
                                        />
                                        <div className="form-text">PDF o imagen de respaldo del gasto.</div>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 mt-3" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Registrar gasto'}
                                </button>
                            </form>
                        </section>

                        <section className="section-card gastos-panel gastos-budget">
                            <header className="gastos-panel__header">
                                <div>
                                    <h3 className="mb-1">Presupuesto anual</h3>
                                    <p className="text-muted mb-0">Actualiza el monto disponible para todo el periodo.</p>
                                </div>
                                {hasBudgetData && (
                                    <span className="badge text-bg-success gastos-budget__badge">
                                        Disponible {formatCurrency(presupuestoDisponible)}
                                    </span>
                                )}
                            </header>
                            <div className="gastos-budget__grid">
                                <div>
                                    <span className="gastos-budget__label">Presupuesto</span>
                                    <strong>{formatCurrency(presupuestoAnual)}</strong>
                                </div>
                                <div>
                                    <span className="gastos-budget__label">Gastado</span>
                                    <strong>{formatCurrency(presupuestoGastado)}</strong>
                                </div>
                                <div>
                                    <span className="gastos-budget__label">Disponible</span>
                                    <strong>{formatCurrency(presupuestoDisponible)}</strong>
                                </div>
                            </div>
                            <div
                                className="progress gastos-budget__progress"
                                role="progressbar"
                                aria-valuenow={presupuestoProgressLabel}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div className="progress-bar bg-success" style={{ width: `${presupuestoProgressLabel}%` }} />
                            </div>
                            <small className="text-muted d-block mb-3">
                                Consumo del presupuesto {presupuestoProgressLabel}%.
                            </small>
                            {budgetStatus && (
                                <div className={`alert alert-${budgetStatus.type}`} role="alert">
                                    {budgetStatus.text}
                                </div>
                            )}
                            <form className="gastos-budget__form" onSubmit={handleBudgetSubmit}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={budgetInput}
                                    onChange={handleBudgetChange}
                                    inputMode="numeric"
                                    maxLength={12}
                                    placeholder="Ej. 20000000"
                                />
                                <button type="submit" className="btn btn-outline-primary" disabled={updatingBudget}>
                                    {updatingBudget ? 'Guardando...' : 'Actualizar'}
                                </button>
                            </form>
                            <span className="form-text">Monto anual en CLP, sin separadores.</span>
                        </section>
                    </div>

                    <div className="gastos-column gastos-column--secondary">
                        <section className="section-card gastos-panel gastos-history">
                            <header className="gastos-panel__header">
                                <div>
                                    <h2>Historial de gastos</h2>
                                    <p className="text-muted mb-0">Filtra y consulta el detalle de tus compras.</p>
                                </div>
                                <span className="gastos-history__total">
                                    Total {filterType !== 'todos' ? 'filtrado' : 'general'}: {formatCurrency(filteredTotalValue)}
                                </span>
                            </header>
                            <div className="row g-3 align-items-end gastos-history__filters">
                                <div className="col-md-4 col-lg-3">
                                    <label className="form-label small mb-1">Periodo</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={filterType}
                                        onChange={handleFilterTypeChange}
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="mes">Mes</option>
                                        <option value="anio">Anio</option>
                                        <option value="semana">Semana</option>
                                    </select>
                                </div>
                                {filterType === 'mes' && (
                                    <div className="col-md-4 col-lg-3">
                                        <label className="form-label small mb-1">Mes</label>
                                        <input
                                            type="month"
                                            className="form-control form-control-sm"
                                            value={filterValue}
                                            onChange={handleFilterValueChange}
                                        />
                                    </div>
                                )}
                                {filterType === 'anio' && (
                                    <div className="col-md-3 col-lg-2">
                                        <label className="form-label small mb-1">Anio</label>
                                        <input
                                            type="number"
                                            min="2000"
                                            max="2100"
                                            className="form-control form-control-sm"
                                            value={filterValue}
                                            onChange={handleFilterValueChange}
                                            placeholder="2025"
                                        />
                                    </div>
                                )}
                                {filterType === 'semana' && (
                                    <div className="col-md-4 col-lg-3">
                                        <label className="form-label small mb-1">Semana</label>
                                        <input
                                            type="week"
                                            className="form-control form-control-sm"
                                            value={filterValue}
                                            onChange={handleFilterValueChange}
                                        />
                                    </div>
                                )}
                                <div className="col-md-3 col-lg-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm w-100"
                                        onClick={handleFiltersReset}
                                        disabled={filterType === 'todos' && !filterValue}
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                            {loading ? (
                                <div className="gastos-empty">Cargando informacion...</div>
                            ) : filteredGastos.length === 0 ? (
                                <div className="gastos-empty">
                                    {gastos.length === 0
                                        ? 'Aun no hay gastos registrados.'
                                        : 'No hay gastos para el filtro seleccionado.'}
                                </div>
                            ) : (
                                <div className="table-responsive gastos-table__wrapper">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Patente</th>
                                                <th>Concepto</th>
                                                <th>Proveedor</th>
                                                <th>Boleta</th>
                                                <th className="text-end">Costo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredGastos.map((gasto) => {
                                                const provider = providersMap.get(String(gasto.proveedorId));
                                                const proveedorNombre =
                                                    provider?.empresa || provider?.razonSocial || gasto.proveedorNombre || 'Sin proveedor';
                                                return (
                                                    <tr key={gasto.id}>
                                                        <td>{gasto.fecha ? new Date(gasto.fecha).toLocaleDateString() : 'Sin fecha'}</td>
                                                        <td>{gasto.patente || '-'}</td>
                                                        <td>{gasto.concepto || '-'}</td>
                                                        <td>{proveedorNombre}</td>
                                                        <td>
                                                            {gasto.boletaPath ? (
                                                                <a
                                                                    href={gasto.boletaPath}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                >
                                                                    Ver boleta
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted">Sin boleta</span>
                                                            )}
                                                        </td>
                                                        <td className="text-end">{formatCurrency(gasto.costo)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                <section className="section-card gastos-budgets">
                    <header className="gastos-panel__header">
                        <div>
                            <h2>Presupuestos por orden de trabajo</h2>
                            <p className="text-muted mb-0">Gestiona la aprobacion antes de registrar gastos.</p>
                        </div>
                        <div className="gastos-budgets__badges">
                            <span className="badge text-bg-secondary">Pendientes: {pendingBudgets}</span>
                            <span className="badge text-bg-success">Aprobados: {approvedBudgets}</span>
                            <span className="badge text-bg-warning">Parciales: {partialBudgets}</span>
                            <span className="badge text-bg-danger">Rechazados: {rejectedBudgets}</span>
                        </div>
                    </header>
                    {budgetAlert && (
                        <div className={`alert alert-${budgetAlert.type}`} role="alert">
                            {budgetAlert.text}
                        </div>
                    )}
                    <div className="row g-3 align-items-end gastos-budgets__filters">
                        <div className="col-sm-4 col-md-3 col-lg-2">
                            <label className="form-label small mb-1">Estado</label>
                            <select
                                className="form-select form-select-sm"
                                value={budgetFilter}
                                onChange={(event) => setBudgetFilter(event.target.value)}
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Aprobado">Aprobado</option>
                                <option value="Parcial">Parcial</option>
                                <option value="Rechazado">Rechazado</option>
                                <option value="todos">Todos</option>
                            </select>
                        </div>
                        <div className="col-sm-8 col-md-4 col-lg-3">
                            <label className="form-label small mb-1">Proveedor</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value={budgetProviderFilter}
                                onChange={handleBudgetProviderFilterChange}
                                placeholder="Ej. Servicios Diesel"
                            />
                        </div>
                        <div className="col-sm-12 col-md">
                            <small className="text-muted d-block">
                                Presupuestos visibles: {filteredBudgets.length} / {budgetStats.total}
                            </small>
                        </div>
                    </div>
                    {filteredBudgets.length === 0 ? (
                        <div className="gastos-empty">
                            {budgets.length === 0
                                ? 'Aun no hay presupuestos generados.'
                                : 'No hay presupuestos con los filtros aplicados.'}
                        </div>
                    ) : (
                        <div className="gastos-budget-list">
                            {filteredBudgets.map((budget) => {
                                const edit = budgetEdits[budget.id] || {};
                                const currentEstado = edit.estado ?? budget.estado;
                                const currentObservacion = edit.observacion ?? (budget.observacion || '');
                                const order = budget.order || {};
                                const provider = providersMap.get(String(order.proveedorId));
                                const providerName = provider?.empresa || provider?.razonSocial || 'Sin proveedor';
                                return (
                                    <article key={budget.id} className="gastos-budget-card">
                                        <div className="gastos-budget-card__header">
                                            <div>
                                                <h3>{order.titulo || `OT #${budget.orderId}`}</h3>
                                                <span className="gastos-budget-card__meta">
                                                    Patente: {order.patente || 'Sin patente'} | Proveedor: {providerName}
                                                </span>
                                                <span className="gastos-budget-card__meta">
                                                    Solicitado: {order.fechaSolicitud ? new Date(order.fechaSolicitud).toLocaleDateString() : 'Sin fecha'}
                                                </span>
                                            </div>
                                            <div className="gastos-budget-card__amount">
                                                <span className="text-muted small">Monto propuesto</span>
                                                <strong>{formatCurrency(budget.monto || 0)}</strong>
                                                <span className="text-muted small">Estado actual: {budget.estado}</span>
                                            </div>
                                        </div>
                                        <div className="row g-3 gastos-budget-card__body">
                                            <div className="col-sm-4 col-md-3">
                                                <label className="form-label small mb-1">Actualizar estado</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={currentEstado}
                                                    onChange={(event) => handleBudgetFieldChange(budget.id, 'estado', event.target.value)}
                                                >
                                                    <option value="Pendiente">Pendiente</option>
                                                    <option value="Aprobado">Aprobado</option>
                                                    <option value="Parcial">Parcial</option>
                                                    <option value="Rechazado">Rechazado</option>
                                                </select>
                                            </div>
                                            <div className="col-sm-8 col-md-5">
                                                <label className="form-label small mb-1">Observacion</label>
                                                <textarea
                                                    className="form-control form-control-sm"
                                                    rows={2}
                                                    maxLength={220}
                                                    value={currentObservacion}
                                                    onChange={(event) => handleBudgetFieldChange(budget.id, 'observacion', event.target.value)}
                                                    placeholder="Comentarios para el solicitante"
                                                />
                                            </div>
                                            <div className="col-md-4 d-flex align-items-end gap-2 justify-content-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleBudgetSave(budget.id)}
                                                    disabled={budgetSavingId === budget.id}
                                                >
                                                    {budgetSavingId === budget.id ? 'Guardando...' : 'Guardar'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => {
                                                        setBudgetEdits((prev) => {
                                                            const next = { ...prev };
                                                            delete next[budget.id];
                                                            return next;
                                                        });
                                                    }}
                                                    disabled={!budgetEdits[budget.id]}
                                                >
                                                    Descartar
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Gastos;
