const {
    listBudgets,
    getBudgetById,
    updateBudgetRequest
} = require('../data/memoryStore');

const estadosPermitidos = new Map([
    ['pendiente', 'Pendiente'],
    ['aprobado', 'Aprobado'],
    ['parcial', 'Parcial'],
    ['rechazado', 'Rechazado']
]);

exports.listarPresupuestos = (req, res) => {
    const budgets = listBudgets();
    return res.status(200).json(budgets);
};

exports.obtenerPresupuesto = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const budget = getBudgetById(id);

    if (!budget) {
        return res.status(404).json({ error: 'Presupuesto no encontrado.' });
    }

    return res.status(200).json(budget);
};

exports.actualizarPresupuesto = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const payload = {};

    if (req.body.estado !== undefined) {
        const estadoNormalizado = String(req.body.estado || '').trim().toLowerCase();
        const estado = estadosPermitidos.get(estadoNormalizado);

        if (!estado) {
            return res.status(400).json({ error: 'Estado de presupuesto inválido.' });
        }

        payload.estado = estado;
    }

    if (req.body.observacion !== undefined) {
        payload.observacion = String(req.body.observacion || '').slice(0, 400);
    }

    if (req.body.monto !== undefined) {
        const monto = Number(req.body.monto);
        if (!Number.isFinite(monto) || monto < 0) {
            return res.status(400).json({ error: 'El monto debe ser un número positivo.' });
        }
        payload.monto = monto;
    }

    if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron cambios para actualizar.' });
    }

    const budget = updateBudgetRequest(id, payload);

    if (!budget) {
        return res.status(404).json({ error: 'Presupuesto no encontrado.' });
    }

    return res.status(200).json(budget);
};
