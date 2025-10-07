import React from 'react';

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);

function NuevaOTForm({
    formData,
    providers,
    trucks,
    drivers,
    onFieldChange,
    onRepuestoChange,
    onAddRepuesto,
    onRemoveRepuesto,
    onSubmit,
    onCancel,
    saving,
    editing
}) {
    const total = formData.repuestos?.reduce(
        (acc, item) => acc + (Number(item.costo) || 0) * (Number(item.cantidad) || 0),
        0
    ) || 0;

    return (
        <form onSubmit={onSubmit} className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="mb-0">{editing ? 'Editar orden de trabajo' : 'Nueva orden de trabajo'}</h4>
                    <small className="text-muted">Completa los datos y registra los repuestos asociados</small>
                </div>
                <span className="badge text-bg-secondary">{formatCurrency(total)}</span>
            </div>

            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Título</label>
                        <input
                            name="titulo"
                            value={formData.titulo}
                            onChange={(event) => onFieldChange(event.target.name, event.target.value)}
                            className="form-control"
                            maxLength={120}
                            inputMode="text"
                            placeholder="Ej. Cambio de filtros"
                            required
                        />
                    </div>
                    <div className="col-md-3 mb-3">
                        <label className="form-label">Patente</label>
                        <select
                            name="patente"
                            value={formData.patente}
                            onChange={(event) => onFieldChange(event.target.name, event.target.value)}
                            className="form-select"
                            required
                        >
                            <option value="">Selecciona una patente</option>
                            {trucks.map((truck) => (
                                <option key={truck.id} value={truck.patente}>
                                    {truck.patente} - {truck.marca} {truck.modelo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-3 mb-3">
                        <label className="form-label">Mecánico</label>
                        <input
                            name="mecanico"
                            value={formData.mecanico}
                            onChange={(event) => onFieldChange(event.target.name, event.target.value)}
                            className="form-control"
                            maxLength={60}
                            inputMode="text"
                            placeholder="Ej. Pedro Salinas"
                            required
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Proveedor</label>
                        <select
                            name="proveedorId"
                            value={formData.proveedorId}
                            onChange={(event) => onFieldChange(event.target.name, event.target.value)}
                            className="form-select"
                            required
                        >
                            <option value="">Selecciona proveedor</option>
                            {providers.map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                    {provider.empresa}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Conductor asignado</label>
                        <select
                            name="conductor"
                            value={formData.conductor}
                            onChange={(event) => onFieldChange(event.target.name, event.target.value)}
                            className="form-select"
                        >
                            <option value="">Sin asignar</option>
                            {drivers.map((driver) => (
                                <option key={driver.id} value={driver.nombre}>
                                    {driver.nombre} ({driver.licencia})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2 mb-3">
                        <label className="form-label">Prioridad</label>
                        <select
                            name="prioridad"
                            value={formData.prioridad}
                            onChange={(event) => onFieldChange(event.target.name, event.target.value)}
                            className="form-select"
                        >
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Descripción del trabajo</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={(event) => onFieldChange(event.target.name, event.target.value)}
                        className="form-control"
                        rows="3"
                        maxLength={400}
                        placeholder="Detalle el trabajo a realizar"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Fecha de solicitud</label>
                    <input
                        type="date"
                        name="fechaSolicitud"
                        value={formData.fechaSolicitud}
                        onChange={(event) => onFieldChange(event.target.name, event.target.value)}
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label mb-0">Repuestos y materiales</label>
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onAddRepuesto}>
                            Agregar repuesto
                        </button>
                    </div>

                    {formData.repuestos.length === 0 ? (
                        <div className="alert alert-light mb-0">No se han agregado repuestos.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-sm align-middle">
                                <thead>
                                    <tr>
                                        <th>Descripción</th>
                                        <th style={{ width: '110px' }}>Cantidad</th>
                                        <th style={{ width: '140px' }}>Costo unitario</th>
                                        <th style={{ width: '140px' }}>Subtotal</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.repuestos.map((item, index) => {
                                        const subtotal = (Number(item.costo) || 0) * (Number(item.cantidad) || 0);
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        className="form-control form-control-sm"
                                                        value={item.nombre}
                                                        onChange={(event) => onRepuestoChange(index, 'nombre', event.target.value)}
                                                        maxLength={80}
                                                        placeholder="Ej. Filtro de aceite"
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={item.cantidad}
                                                        min="0"
                                                        inputMode="numeric"
                                                        onChange={(event) => onRepuestoChange(index, 'cantidad', event.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={item.costo}
                                                        min="0"
                                                        step="100"
                                                        inputMode="numeric"
                                                        onChange={(event) => onRepuestoChange(index, 'costo', event.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td className="text-end">
                                                    <span className="fw-semibold">{formatCurrency(subtotal)}</span>
                                                </td>
                                                <td className="text-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link text-danger p-0"
                                                        onClick={() => onRemoveRepuesto(index)}
                                                        aria-label="Eliminar repuesto"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-footer d-flex justify-content-between">
                {editing && (
                    <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                        Cancelar edición
                    </button>
                )}
                <button type="submit" className="btn btn-primary ms-auto" disabled={saving}>
                    {saving ? 'Guardando...' : editing ? 'Actualizar OT' : 'Crear OT'}
                </button>
            </div>
        </form>
    );
}

NuevaOTForm.defaultProps = {
    formData: {
        titulo: '',
        patente: '',
        mecanico: '',
        proveedorId: '',
        prioridad: 'Media',
        descripcion: '',
        fechaSolicitud: '',
        conductor: '',
        repuestos: []
    },
    providers: [],
    trucks: [],
    drivers: []
};

export default NuevaOTForm;
