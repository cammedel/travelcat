const {
    listExpenses,
    createExpense,
    getBudgetInfo,
    updateBudget,
    getProviderById
} = require('../data/memoryStore');

exports.obtenerGastos = (req, res) => {
    const gastos = listExpenses();
    return res.status(200).json({
        gastos,
        presupuesto: getBudgetInfo()
    });
};

exports.registrarGasto = (req, res) => {
    const { patente, concepto, costo } = req.body;

    if (!patente || !concepto || costo === undefined) {
        return res.status(400).json({ error: 'Patente, concepto y costo son obligatorios.' });
    }

    const valor = Number(costo);

    if (!Number.isFinite(valor) || valor <= 0) {
        return res.status(400).json({ error: 'El costo debe ser un número mayor a cero.' });
    }

    const file = req.file;

    let proveedorId = req.body.proveedorId !== undefined ? Number(req.body.proveedorId) : null;
    if (!Number.isFinite(proveedorId) || proveedorId <= 0) {
        proveedorId = null;
    }

    let proveedorNombre = null;
    if (proveedorId) {
        const proveedor = getProviderById(proveedorId);
        if (!proveedor) {
            proveedorId = null;
        } else {
            proveedorNombre = proveedor.empresa || proveedor.razonSocial || null;
        }
    }

    const nuevoGasto = createExpense({
        patente: req.body.patente,
        concepto: req.body.concepto,
        costo: valor,
        fecha: req.body.fecha,
        proveedorId,
        proveedorNombre,
        boletaPath: file ? `/uploads/boletas/${file.filename}` : null,
        boletaNombre: file ? file.originalname : null,
        boletaMime: file ? file.mimetype : null
    });
    return res.status(201).json(nuevoGasto);
};

exports.actualizarPresupuesto = (req, res) => {
    const { presupuestoAnual } = req.body || {};
    const monto = Number(presupuestoAnual);

    if (!Number.isFinite(monto) || monto <= 0) {
        return res.status(400).json({ error: 'El presupuesto debe ser un numero mayor a cero.' });
    }

    const info = updateBudget(monto);
    return res.status(200).json(info);
};
