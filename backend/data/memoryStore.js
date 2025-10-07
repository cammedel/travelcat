const crypto = require('crypto');

const users = [
    {
        id: 1,
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Administrador General'
    }
];

let trucks = [
    {
        id: 1,
        patente: 'AA-BB11',
        marca: 'Volvo',
        modelo: 'FH16',
        anio: 2021,
        km: 125430,
        fechaEntrada: '2021-02-15',
        fechaSalida: '',
        estado: 'Operativo',
        notas: 'CamiÃ³n principal para rutas largas',
        conductor: 'Carlos Rivas'
    },
    {
        id: 2,
        patente: 'CC-DD22',
        marca: 'Scania',
        modelo: 'R500',
        anio: 2019,
        km: 210780,
        fechaEntrada: '2019-09-08',
        fechaSalida: '',
        estado: 'Operativo',
        notas: 'Pendiente revisiÃ³n tÃ©cnica trimestral',
        conductor: 'Elena MuÃ±oz'
    }
];

let providers = [
    {
        id: 1,
        razonSocial: 'Servicios Diesel Limitada',
        empresa: 'Servicios Diesel',
        rut: '761234567',
        contacto: 'Juan PÃ©rez',
        telefono: '+56 9 5555 5555',
        email: 'contacto@serviciosdiesel.cl',
        rubro: 'MantenciÃ³n de motores'
    },
    {
        id: 2,
        razonSocial: 'TecnologÃ­as HidrÃ¡ulicas SPA',
        empresa: 'TecHidrÃ¡ulica',
        rut: '789876543',
        contacto: 'MarÃ­a GonzÃ¡lez',
        telefono: '+56 2 2345 6789',
        email: 'ventas@techidraulica.cl',
        rubro: 'ReparaciÃ³n de sistemas hidrÃ¡ulicos'
    }
];

let drivers = [
    { id: 1, nombre: 'Carlos Rivas', licencia: 'A5', telefono: '+56 9 1111 1111' },
    { id: 2, nombre: 'Elena MuÃ±oz', licencia: 'A4', telefono: '+56 9 2222 2222' },
    { id: 3, nombre: 'Luis FernÃ¡ndez', licencia: 'A5', telefono: '+56 9 3333 3333' }
];

let orders = [
    {
        id: 1,
        titulo: 'Cambio de filtros motor',
        patente: 'AA-BB11',
        mecanico: 'Pedro Salinas',
        proveedorId: 1,
        conductor: 'Carlos Rivas',
        prioridad: 'Alta',
        estado: 'En progreso',
        descripcion: 'RevisiÃ³n completa del sistema de lubricaciÃ³n y cambio de filtros.',
        fechaSolicitud: '2024-05-12',
        repuestos: [
            { nombre: 'Filtro de aceite', cantidad: 2, costo: 45000 },
            { nombre: 'Filtro de combustible', cantidad: 1, costo: 38000 }
        ]
    },
    {
        id: 2,
        titulo: 'RevisiÃ³n frenos',
        patente: 'CC-DD22',
        mecanico: 'Valentina Soto',
        proveedorId: 2,
        conductor: 'Elena MuÃ±oz',
        prioridad: 'Media',
        estado: 'Pendiente',
        descripcion: 'DiagnÃ³stico y ajuste de frenos tras reporte de vibraciÃ³n.',
        fechaSolicitud: '2024-06-03',
        repuestos: [
            { nombre: 'Pastillas freno traseras', cantidad: 4, costo: 29000 }
        ]
    }
];

const sales = [
    { mes: 'Enero', monto: 12000000 },
    { mes: 'Febrero', monto: 9800000 },
    { mes: 'Marzo', monto: 13100000 },
    { mes: 'Abril', monto: 14250000 },
    { mes: 'Mayo', monto: 15120000 },
    { mes: 'Junio', monto: 16080000 },
    { mes: 'Julio', monto: 14800000 },
    { mes: 'Agosto', monto: 15230000 },
    { mes: 'Septiembre', monto: 16740000 },
    { mes: 'Octubre', monto: 17120000 },
    { mes: 'Noviembre', monto: 18950000 },
    { mes: 'Diciembre', monto: 21000000 }
];

let documents = [
    {
        id: 1,
        truckId: 1,
        patente: 'AA-BB11',
        tipo: 'Permiso de circulaciÃ³n',
        vence: '2024-11-05',
        responsable: 'Carlos Rivas',
        fileName: null,
        originalName: null,
        mimeType: null,
        size: null
    },
    {
        id: 2,
        truckId: 2,
        patente: 'CC-DD22',
        tipo: 'RevisiÃ³n tÃ©cnica',
        vence: '2024-08-18',
        responsable: 'Elena MuÃ±oz',
        fileName: null,
        originalName: null,
        mimeType: null,
        size: null
    },
    {
        id: 3,
        truckId: 1,
        patente: 'AA-BB11',
        tipo: 'Seguro obligatorio',
        vence: '2025-02-01',
        responsable: 'AdministraciÃ³n',
        fileName: null,
        originalName: null,
        mimeType: null,
        size: null
    }
];

let expenses = [
    {
        id: 1,
        patente: 'AA-BB11',
        concepto: 'Juego de neumÃ¡ticos',
        costo: 520000,
        fecha: '2024-04-20',
        boletaPath: null,
        boletaNombre: null,
        boletaMime: null,
        proveedorId: 1,
        proveedorNombre: 'Servicios Diesel'
    },
    {
        id: 2,
        patente: 'CC-DD22',
        concepto: 'Kit de frenos',
        costo: 315000,
        fecha: '2024-05-10',
        boletaPath: null,
        boletaNombre: null,
        boletaMime: null,
        proveedorId: 2,
        proveedorNombre: 'Tecnolog��as Hidrǭulicas SPA'
    }
];

let maintenancePrograms = [
    {
        id: 1,
        patente: 'AA-BB11',
        tarea: 'Cambio de aceite motor',
        tipoControl: 'km',
        fecha: '2024-05-01',
        ultimoKm: 123000,
        intervalo: 8000,
        proximoControl: '131000 km'
    },
    {
        id: 2,
        patente: 'CC-DD22',
        tarea: 'RevisiÃ³n general',
        tipoControl: 'fecha',
        fecha: '2024-06-15',
        ultimoKm: '',
        intervalo: 90,
        proximoControl: '12-09-2024'
    }
];

let orderBudgets = [
    {
        id: 1,
        orderId: 1,
        monto: 128000,
        estado: 'Pendiente',
        observacion: '',
        createdAt: '2024-06-15T09:00:00.000Z',
        updatedAt: '2024-06-15T09:00:00.000Z'
    },
    {
        id: 2,
        orderId: 2,
        monto: 29000,
        estado: 'Aprobado',
        observacion: 'Continuar con la revision segun cronograma.',
        createdAt: '2024-06-20T10:30:00.000Z',
        updatedAt: '2024-06-22T14:45:00.000Z'
    }
];

let notifications = [
    {
        id: 1,
        message: 'El presupuesto de la OT "Revision frenos" fue aprobado.',
        type: 'success',
        orderId: 2,
        budgetId: 2,
        read: false,
        createdAt: '2024-06-22T15:00:00.000Z'
    }
];

let gastoPresupuestoAnual = 15000000;

const sessions = new Map();
let nextTruckId = trucks.length + 1;
let nextProviderId = providers.length + 1;
let nextDriverId = drivers.length + 1;
let nextOrderId = orders.length + 1;
let nextDocumentId = documents.length + 1;
let nextExpenseId = expenses.length + 1;
let nextMaintenanceId = maintenancePrograms.length + 1;
let nextBudgetId = orderBudgets.length + 1;
let nextNotificationId = notifications.length + 1;

function sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
}

function findUserByEmail(email) {
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function createSession(userId) {
    const token = crypto.randomUUID();
    sessions.set(token, { userId, createdAt: Date.now() });
    return token;
}

function getUserByToken(token) {
    const session = sessions.get(token);
    if (!session) return null;
    return sanitizeUser(users.find((user) => user.id === session.userId));
}

function removeSession(token) {
    sessions.delete(token);
}

function calcDocumentState(doc) {
    if (!doc || !doc.vence) {
        return { estado: 'Sin fecha', dias: null };
    }

    const now = new Date();
    const target = new Date(doc.vence);

    if (Number.isNaN(target.getTime())) {
        return { estado: 'Sin fecha', dias: null };
    }

    const diffMs = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
    const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (dias < 0) {
        return { estado: 'Vencido', dias };
    }

    if (dias <= 30) {
        return { estado: 'Por vencer', dias };
    }

    return { estado: 'Vigente', dias };
}

function getDocumentsByTruck(truckId) {
    return documents
        .filter((doc) => doc.truckId === truckId)
        .map((doc) => {
            const status = calcDocumentState(doc);
            return {
                ...doc,
                ...status
            };
        });
}

function listTrucks() {
    return trucks.map((truck) => ({
        ...truck,
        documentos: getDocumentsByTruck(truck.id)
    }));
}

function createTruck(data) {
    const newTruck = {
        id: nextTruckId++,
        patente: data.patente,
        marca: data.marca,
        modelo: data.modelo,
        anio: Number(data.anio) || null,
        km: Number(data.km) || 0,
        fechaEntrada: data.fechaEntrada || '',
        fechaSalida: data.fechaSalida || '',
        estado: data.estado || 'Operativo',
        notas: data.notas || '',
        conductor: data.conductor || ''
    };

    trucks.push(newTruck);
    return newTruck;
}

function updateTruck(id, data) {
    const index = trucks.findIndex((truck) => truck.id === id);
    if (index === -1) return null;

    const updatedTruck = {
        ...trucks[index],
        ...data,
        anio: data.anio !== undefined ? (Number(data.anio) || null) : trucks[index].anio,
        km: data.km !== undefined ? (Number(data.km) || 0) : trucks[index].km,
        conductor: data.conductor !== undefined ? data.conductor : trucks[index].conductor
    };

    trucks[index] = updatedTruck;
    return updatedTruck;
}

function deleteTruck(id) {
    const index = trucks.findIndex((truck) => truck.id === id);
    if (index === -1) return false;

    trucks.splice(index, 1);
    return true;
}

function listProviders() {
    return providers;
}

function getProviderById(id) {
    const target = Number(id);
    if (!Number.isFinite(target)) return null;
    return providers.find((provider) => provider.id === target) || null;
}

function createProvider(data) {
    const newProvider = {
        id: nextProviderId++,
        razonSocial: data.razonSocial,
        empresa: data.empresa,
        rut: data.rut,
        contacto: data.contacto,
        telefono: data.telefono || '',
        email: data.email || '',
        rubro: data.rubro || ''
    };

    providers.push(newProvider);
    return newProvider;
}

function updateProvider(id, data) {
    const index = providers.findIndex((provider) => provider.id === id);
    if (index === -1) return null;

    const updatedProvider = {
        ...providers[index],
        ...data
    };

    providers[index] = updatedProvider;
    return updatedProvider;
}

function deleteProvider(id) {
    const index = providers.findIndex((provider) => provider.id === id);
    if (index === -1) return false;

    providers.splice(index, 1);
    return true;
}

function listDrivers() {
    return drivers;
}

function withOrderTotals(order) {
    return {
        ...order,
        totalCosto: order.repuestos?.reduce((acc, item) => acc + (item.costo || 0) * (item.cantidad || 0), 0) || 0
    };
}

function listOrders() {
    return orders.map(withOrderTotals);
}

function getOrderById(id) {
    const order = orders.find((item) => item.id === id);
    return order ? withOrderTotals(order) : null;
}

function createOrder(data) {
    const repuestos = Array.isArray(data.repuestos)
        ? data.repuestos.map((item, index) => ({
            id: index + 1,
            nombre: item.nombre,
            cantidad: Number(item.cantidad) || 0,
            costo: Number(item.costo) || 0
        }))
        : [];

    const newOrder = {
        id: nextOrderId++,
        titulo: data.titulo,
        patente: data.patente,
        mecanico: data.mecanico,
        proveedorId: Number(data.proveedorId) || null,
        conductor: data.conductor || '',
        prioridad: data.prioridad || 'Media',
        estado: 'Pendiente',
        descripcion: data.descripcion || '',
        fechaSolicitud: data.fechaSolicitud || new Date().toISOString().slice(0, 10),
        repuestos
    };

    orders.push(newOrder);
    return withOrderTotals(newOrder);
}

function updateOrder(id, data) {
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1) return null;

    const repuestos = Array.isArray(data.repuestos)
        ? data.repuestos.map((item, idx) => ({
            id: item.id || idx + 1,
            nombre: item.nombre,
            cantidad: Number(item.cantidad) || 0,
            costo: Number(item.costo) || 0
        }))
        : orders[index].repuestos;

    const updatedOrder = {
        ...orders[index],
        ...data,
        proveedorId: data.proveedorId !== undefined ? Number(data.proveedorId) || null : orders[index].proveedorId,
        repuestos
    };

    orders[index] = updatedOrder;
    return withOrderTotals(updatedOrder);
}

function deleteOrder(id) {
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1) return false;

    orders.splice(index, 1);
    orderBudgets = orderBudgets.filter((budget) => budget.orderId !== id);
    return true;
}

function withBudgetDetails(budget) {
    const order = getOrderById(budget.orderId);
    return {
        ...budget,
        order: order
            ? {
                id: order.id,
                titulo: order.titulo,
                patente: order.patente,
                proveedorId: order.proveedorId,
                totalCosto: order.totalCosto,
                prioridad: order.prioridad,
                estado: order.estado,
                fechaSolicitud: order.fechaSolicitud
            }
            : null
    };
}

function listBudgets() {
    return orderBudgets.map(withBudgetDetails);
}

function getBudgetById(id) {
    const budget = orderBudgets.find((item) => item.id === id);
    return budget ? withBudgetDetails(budget) : null;
}

function createBudgetForOrder(orderId) {
    const order = getOrderById(orderId);
    if (!order) return null;

    const existingPending = orderBudgets.find(
        (item) => item.orderId === orderId && item.estado === 'Pendiente'
    );
    if (existingPending) {
        return withBudgetDetails(existingPending);
    }

    const now = new Date().toISOString();
    const budget = {
        id: nextBudgetId++,
        orderId,
        monto: order.totalCosto || 0,
        estado: 'Pendiente',
        observacion: '',
        createdAt: now,
        updatedAt: now
    };

    orderBudgets.push(budget);
    createNotification({
        message: `Nuevo presupuesto pendiente para la OT "${order.titulo}".`,
        type: 'info',
        orderId: orderId,
        budgetId: budget.id
    });

    return withBudgetDetails(budget);
}

function updateBudgetRequest(id, data) {
    const index = orderBudgets.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const previous = orderBudgets[index];
    const nextState = data.estado ?? previous.estado;
    const nextObservation =
        typeof data.observacion === 'string' ? data.observacion : previous.observacion;
    const nextMonto =
        data.monto !== undefined && Number.isFinite(Number(data.monto))
            ? Number(data.monto)
            : previous.monto;

    const now = new Date().toISOString();

    const updated = {
        ...previous,
        estado: nextState,
        observacion: nextObservation,
        monto: nextMonto,
        updatedAt: now
    };

    orderBudgets[index] = updated;

    if (data.estado && data.estado !== previous.estado) {
        const order = getOrderById(updated.orderId);
        const notificationType =
            data.estado === 'Aprobado'
                ? 'success'
                : data.estado === 'Rechazado'
                    ? 'danger'
                    : 'warning';
        createNotification({
            message: `El presupuesto de la OT "${order?.titulo || updated.orderId}" fue ${data.estado.toLowerCase()}.`,
            type: notificationType,
            orderId: updated.orderId,
            budgetId: updated.id
        });
    }

    return withBudgetDetails(updated);
}

function createNotification({ message, type = 'info', orderId = null, budgetId = null }) {
    const notification = {
        id: nextNotificationId++,
        message,
        type,
        orderId,
        budgetId,
        read: false,
        createdAt: new Date().toISOString()
    };

    notifications.push(notification);
    return notification;
}

function listNotifications() {
    return [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

function markNotificationAsRead(id) {
    const notification = notifications.find((item) => item.id === id);
    if (!notification) return null;
    notification.read = true;
    notification.readAt = new Date().toISOString();
    return notification;
}

function markAllNotificationsAsRead() {
    const now = new Date().toISOString();
    notifications.forEach((item) => {
        item.read = true;
        item.readAt = now;
    });
    return listNotifications();
}

function listSales() {
    return sales;
}

function listDocuments() {
    return documents.map((doc) => ({
        ...doc,
        fileUrl: doc.fileName ? `/uploads/documentos/${doc.fileName}` : null,
        ...calcDocumentState(doc)
    }));
}

function createDocument(data) {
    const truck = trucks.find((item) => item.patente === data.patente);
    const newDocument = {
        id: nextDocumentId++,
        truckId: data.truckId || truck?.id || null,
        patente: data.patente,
        tipo: data.tipo,
        vence: data.vence,
        responsable: data.responsable || '',
        fileName: data.fileName || null,
        originalName: data.originalName || null,
        mimeType: data.mimeType || null,
        size: data.size || null
    };

    documents.push(newDocument);
    return {
        ...newDocument,
        fileUrl: newDocument.fileName ? `/uploads/documentos/${newDocument.fileName}` : null,
        ...calcDocumentState(newDocument)
    };
}

function listExpenses() {
    return expenses;
}

function createExpense(data) {
    const newExpense = {
        id: nextExpenseId++,
        patente: data.patente,
        concepto: data.concepto,
        costo: Number(data.costo) || 0,
        fecha: data.fecha || new Date().toISOString().slice(0, 10),
        boletaPath: data.boletaPath || null,
        boletaNombre: data.boletaNombre || null,
        boletaMime: data.boletaMime || null,
        proveedorId: data.proveedorId ?? null,
        proveedorNombre: data.proveedorNombre ?? null
    };

    expenses.push(newExpense);
    return newExpense;
}

function createDocumentsForTruck(truckId, patente, docs = []) {
    const created = [];

    docs.forEach((doc) => {
        const record = {
            id: nextDocumentId++,
            truckId,
            patente,
            tipo: doc.tipo,
            vence: doc.vence || null,
            responsable: doc.responsable || '',
            fileName: doc.fileName || null,
            originalName: doc.originalName || null,
            mimeType: doc.mimeType || null,
            size: doc.size || null
        };

        documents.push(record);
        created.push({
            ...record,
            fileUrl: record.fileName ? `/uploads/documentos/${record.fileName}` : null,
            ...calcDocumentState(record)
        });
    });

    return created;
}

function removeDocuments(documentIds = []) {
    if (!Array.isArray(documentIds) || documentIds.length === 0) return [];
    const removed = [];
    documentIds.forEach((id) => {
        const index = documents.findIndex((doc) => doc.id === id);
        if (index !== -1) {
            const [doc] = documents.splice(index, 1);
            removed.push(doc);
        }
    });
    return removed;
}

function listMaintenancePrograms() {
    return maintenancePrograms;
}

function createMaintenanceProgram(data) {
    const nextId = nextMaintenanceId++;

    const program = {
        id: nextId,
        patente: data.patente,
        tarea: data.tarea,
        tipoControl: data.tipoControl,
        fecha: data.fecha || new Date().toISOString().slice(0, 10),
        ultimoKm: data.tipoControl === 'km' ? Number(data.ultimoKm) || 0 : '',
        intervalo: Number(data.intervalo) || 0,
        proximoControl: data.proximoControl || ''
    };

    maintenancePrograms.push(program);
    return program;
}

function deleteMaintenanceProgram(id) {
    const index = maintenancePrograms.findIndex((program) => program.id === id);
    if (index === -1) return false;
    maintenancePrograms.splice(index, 1);
    return true;
}

function getMaintenanceAlerts() {
    const now = new Date();

    return maintenancePrograms.map((program) => {
        let dias = null;
        let estado = 'Sin datos';

        if (program.tipoControl === 'km') {
            dias = null;
            estado = 'Por kilometraje';
        } else if (program.tipoControl === 'fecha') {
            const base = program.fecha ? new Date(program.fecha) : null;
            const intervaloDias = Number(program.intervalo || 0);

            if (base && !Number.isNaN(base.getTime()) && intervaloDias) {
                const next = new Date(base);
                next.setDate(base.getDate() + intervaloDias);
                const diffMs = next.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
                dias = Math.round(diffMs / (1000 * 60 * 60 * 24));

                if (dias < 0) estado = 'Vencido';
                else if (dias <= 15) estado = 'Por vencer';
                else estado = 'Programado';
            }
        }

        return {
            ...program,
            estado,
            dias
        };
    });
}

function getBudgetInfo() {
    const totalGastado = expenses.reduce((acc, item) => acc + item.costo, 0);
    return {
        presupuestoAnual: gastoPresupuestoAnual,
        gastado: totalGastado,
        disponible: Math.max(gastoPresupuestoAnual - totalGastado, 0)
    };
}

function updateBudget(amount) {
    const monto = Number(amount);
    if (!Number.isFinite(monto) || monto < 0) {
        return getBudgetInfo();
    }
    gastoPresupuestoAnual = monto;
    return getBudgetInfo();
}

function getCostsByTruck() {
    const base = new Map();

    const addCost = (patente, monto) => {
        if (!patente) return;
        const current = base.get(patente) || 0;
        base.set(patente, current + monto);
    };

    listOrders().forEach((order) => {
        addCost(order.patente, order.totalCosto || 0);
    });

    expenses.forEach((expense) => {
        addCost(expense.patente, expense.costo || 0);
    });

    return Array.from(base.entries()).map(([patente, total]) => ({ patente, total }));
}

module.exports = {
    sanitizeUser,
    findUserByEmail,
    createSession,
    getUserByToken,
    removeSession,
    listTrucks,
    createTruck,
    updateTruck,
    deleteTruck,
    listProviders,
    getProviderById,
    createProvider,
    updateProvider,
    deleteProvider,
    listDrivers,
    listOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    listBudgets,
    getBudgetById,
    createBudgetForOrder,
    updateBudgetRequest,
    listSales,
    listDocuments,
    createDocument,
    listExpenses,
    createExpense,
    createDocumentsForTruck,
    removeDocuments,
    listMaintenancePrograms,
    createMaintenanceProgram,
    deleteMaintenanceProgram,
    getMaintenanceAlerts,
    getBudgetInfo,
    listNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updateBudget,
    getCostsByTruck
};


