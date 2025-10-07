import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const NotificationsBell = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    const headers = useMemo(
        () => ({
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
        }),
        [token]
    );

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/notifications`, {
                headers: { Authorization: 'Bearer ' + token }
            });

            if (!response.ok) {
                throw new Error('No se pudieron obtener las notificaciones.');
            }

            const data = await response.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token, fetchNotifications]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const unreadCount = useMemo(
        () => notifications.filter((notification) => !notification.read).length,
        [notifications]
    );

    const toggleDropdown = () => {
        const nextState = !open;
        setOpen(nextState);
        if (nextState) {
            fetchNotifications();
        }
    };

    const markAsRead = async (id) => {
        try {
            const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: 'POST',
                headers
            });

            if (!response.ok) {
                throw new Error('No se pudo actualizar la notificacion.');
            }

            const updated = await response.json();
            setNotifications((prev) => prev.map((item) => (item.id === id ? updated : item)));
        } catch (markError) {
            setError(markError.message);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch(`${API_BASE}/notifications/read-all`, {
                method: 'POST',
                headers
            });

            if (!response.ok) {
                throw new Error('No se pudo marcar como leidas.');
            }

            const updated = await response.json();
            setNotifications(Array.isArray(updated) ? updated : []);
        } catch (markAllError) {
            setError(markAllError.message);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <div className="position-relative" ref={containerRef}>
            <button
                type="button"
                className="btn btn-link text-white p-0 position-relative"
                onClick={toggleDropdown}
                aria-label="Notificaciones"
            >
                <FiBell size={22} />
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <div
                className={`dropdown-menu dropdown-menu-end shadow ${open ? 'show' : ''}`}
                style={{ minWidth: '320px', maxWidth: '360px', maxHeight: '360px', overflowY: 'auto' }}
            >
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                    <strong>Notificaciones</strong>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Marcar todo
                    </button>
                </div>

                {loading ? (
                    <div className="px-3 py-3 text-muted small">Cargando notificaciones...</div>
                ) : error ? (
                    <div className="px-3 py-3 text-danger small">{error}</div>
                ) : notifications.length === 0 ? (
                    <div className="px-3 py-3 text-muted small">No hay notificaciones pendientes.</div>
                ) : (
                    notifications.map((notification) => {
                        const dateLabel = notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString()
                            : '';

                        return (
                            <div
                                key={notification.id}
                                className={`px-3 py-3 border-bottom ${notification.read ? 'bg-white' : 'bg-light'}`}
                            >
                                <div className="d-flex justify-content-between align-items-start gap-2">
                                    <div>
                                        <div className="fw-semibold small">{notification.message}</div>
                                        <div className="text-muted small">{dateLabel}</div>
                                    </div>
                                    {!notification.read && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            Marcar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NotificationsBell;
