const express = require('express');
const router = express.Router();
const budgetController = require('../controller/budgetController');

router.get('/', budgetController.listarPresupuestos);
router.get('/:id', budgetController.obtenerPresupuesto);
router.put('/:id', budgetController.actualizarPresupuesto);

module.exports = router;
