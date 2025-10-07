// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const truckRoutes = require('./routes/truckRoutes');
const providerRoutes = require('./routes/providerRoutes');
const otRoutes = require('./routes/otRoutes');
const reportRoutes = require('./routes/reportRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const referenceRoutes = require('./routes/referenceRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.status(200).send('API de Mantenimiento Funcionando');
});

app.use('/api/auth', authRoutes);
app.use('/api/trucks', authMiddleware, truckRoutes);
app.use('/api/providers', authMiddleware, providerRoutes);
app.use('/api/ots', authMiddleware, otRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/reference', authMiddleware, referenceRoutes);
app.use('/api/maintenance-programs', authMiddleware, maintenanceRoutes);
app.use('/api/budgets', authMiddleware, budgetRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);

app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`);
});
