const {
    listOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    createBudgetForOrder
} = require('../data/memoryStore');

const estadosPermitidos = new Map([
    ['pendiente', 'Pendiente'],
    ['en progreso', 'En progreso'],
    ['en_progreso', 'En progreso'],
    ['en-progreso', 'En progreso'],
    ['progreso', 'En progreso'],
    ['finalizada', 'Finalizada'],
    ['finalizado', 'Finalizada'],
    ['finalizo', 'Finalizada'],
    ['rechazada', 'Rechazada'],
    ['rechazado', 'Rechazada']
]);

const prioridadesPermitidas = new Map([
    ['alta', 'Alta'],
    ['media', 'Media'],
    ['baja', 'Baja']
]);

exports.obtenerOTs = (req, res) => {
    const orders = listOrders();
    return res.status(200).json(orders);
};

exports.crearOT = (req, res) => {
    const { titulo, patente, mecanico, proveedorId, descripcion } = req.body;

    if (!titulo || !patente || !mecanico || !proveedorId) {
        return res.status(400).json({ error: 'Título, patente, mecánico y proveedor son obligatorios.' });
    }

    const payload = { ...req.body };

    if (payload.prioridad) {
        const prioridadNormalizada = String(payload.prioridad || '').trim().toLowerCase();
        payload.prioridad = prioridadesPermitidas.get(prioridadNormalizada) || 'Media';
    }

    delete payload.estado;

    const order = createOrder(payload);
    return res.status(201).json(order);
};

exports.actualizarOT = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const payload = { ...req.body };

    if (payload.estado !== undefined) {
        const estadoNormalizado = String(payload.estado || '').trim().toLowerCase();
        const estado = estadosPermitidos.get(estadoNormalizado);

        if (!estado) {
            return res.status(400).json({ error: 'Estado de orden inválido.' });
        }

        payload.estado = estado;
    }

    if (payload.prioridad !== undefined) {
        const prioridadNormalizada = String(payload.prioridad || '').trim().toLowerCase();
        payload.prioridad = prioridadesPermitidas.get(prioridadNormalizada) || 'Media';
    }

    const order = updateOrder(id, payload);

    if (!order) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada.' });
    }

    return res.status(200).json(order);
};

exports.eliminarOT = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const removed = deleteOrder(id);

    if (!removed) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada.' });
    }

    return res.status(204).send();
};

exports.descargarOT = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const order = getOrderById(id);

    if (!order) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada.' });
    }

    res.setHeader('Content-Disposition', `attachment; filename=ot-${order.patente}-${order.id}.json`);
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).send(JSON.stringify(order, null, 2));
};

exports.generarPresupuesto = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const budget = createBudgetForOrder(id);

    if (!budget) {
        return res.status(404).json({ error: 'Orden de trabajo no encontrada.' });
    }

    return res.status(201).json(budget);
};
