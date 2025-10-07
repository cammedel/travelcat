const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.get('/', notificationController.listarNotificaciones);
router.post('/read-all', notificationController.marcarTodas);
router.post('/:id/read', notificationController.marcarComoLeida);

module.exports = router;
