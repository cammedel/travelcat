const {
    listNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
} = require('../data/memoryStore');

exports.listarNotificaciones = (req, res) => {
    const notifications = listNotifications();
    return res.status(200).json(notifications);
};

exports.marcarComoLeida = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador inválido.' });
    }

    const notification = markNotificationAsRead(id);

    if (!notification) {
        return res.status(404).json({ error: 'Notificación no encontrada.' });
    }

    return res.status(200).json(notification);
};

exports.marcarTodas = (req, res) => {
    const notifications = markAllNotificationsAsRead();
    return res.status(200).json(notifications);
};
