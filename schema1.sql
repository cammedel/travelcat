CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    name VARCHAR(120) NOT NULL
);

CREATE TABLE trucks (
    id INT PRIMARY KEY,
    patente VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(60),
    modelo VARCHAR(60),
    anio SMALLINT,
    km INT,
    fecha_entrada DATE,
    fecha_salida DATE,
    estado VARCHAR(40),
    notas TEXT,
    conductor VARCHAR(120)
);

CREATE TABLE providers (
    id INT PRIMARY KEY,
    razon_social VARCHAR(160),
    empresa VARCHAR(160),
    rut VARCHAR(12) UNIQUE,
    contacto VARCHAR(120),
    telefono VARCHAR(30),
    email VARCHAR(160),
    rubro VARCHAR(160)
);

CREATE TABLE drivers (
    id INT PRIMARY KEY,
    nombre VARCHAR(120),
    licencia VARCHAR(10),
    telefono VARCHAR(30)
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    titulo VARCHAR(160) NOT NULL,
    patente VARCHAR(10) REFERENCES trucks(patente),
    mecanico VARCHAR(120),
    proveedor_id INT REFERENCES providers(id),
    conductor VARCHAR(120),
    prioridad VARCHAR(20),
    estado VARCHAR(40),
    descripcion TEXT,
    fecha_solicitud DATE
);

CREATE TABLE order_parts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    nombre VARCHAR(120),
    cantidad INT,
    costo INT
);

CREATE TABLE sales (
    mes VARCHAR(20) PRIMARY KEY,
    monto INT
);

CREATE TABLE documents (
    id INT PRIMARY KEY,
    truck_id INT REFERENCES trucks(id),
    patente VARCHAR(10),
    tipo VARCHAR(120),
    vence DATE,
    responsable VARCHAR(120),
    file_name VARCHAR(160),
    original_name VARCHAR(160),
    mime_type VARCHAR(80),
    size INT
);

CREATE TABLE expenses (
    id INT PRIMARY KEY,
    patente VARCHAR(10),
    concepto VARCHAR(160),
    costo INT,
    fecha DATE,
    boleta_path VARCHAR(200),
    boleta_nombre VARCHAR(160),
    boleta_mime VARCHAR(80)
);

CREATE TABLE maintenance_programs (
    id INT PRIMARY KEY,
    patente VARCHAR(10) REFERENCES trucks(patente),
    tarea VARCHAR(160),
    tipo_control VARCHAR(20),
    fecha DATE,
    ultimo_km INT,
    intervalo INT,
    proximo_control VARCHAR(120)
);

CREATE TABLE order_budgets (
    id INT PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    monto INT,
    estado VARCHAR(20),
    observacion TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE notifications (
    id INT PRIMARY KEY,
    message VARCHAR(255),
    type VARCHAR(20),
    order_id INT REFERENCES orders(id),
    budget_id INT REFERENCES order_budgets(id),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    read_at TIMESTAMP
);

-- configuración inicial
INSERT INTO users VALUES
(1, 'admin@example.com', 'admin123', 'Administrador General');

INSERT INTO trucks VALUES
(1, 'AA-BB11', 'Volvo', 'FH16', 2021, 125430, '2021-02-15', NULL, 'Operativo', 'Camión principal para rutas largas', 'Carlos Rivas'),
(2, 'CC-DD22', 'Scania', 'R500', 2019, 210780, '2019-09-08', NULL, 'Operativo', 'Pendiente revisión técnica trimestral', 'Elena Muñoz');

INSERT INTO providers VALUES
(1, 'Servicios Diesel Limitada', 'Servicios Diesel', '761234567', 'Juan Pérez', '+56 9 5555 5555', 'contacto@serviciosdiesel.cl', 'Mantención de motores'),
(2, 'Tecnologías Hidráulicas SPA', 'TecHidráulica', '789876543', 'María González', '+56 2 2345 6789', 'ventas@techidraulica.cl', 'Reparación de sistemas hidráulicos');

INSERT INTO drivers VALUES
(1, 'Carlos Rivas', 'A5', '+56 9 1111 1111'),
(2, 'Elena Muñoz', 'A4', '+56 9 2222 2222'),
(3, 'Luis Fernández', 'A5', '+56 9 3333 3333');

INSERT INTO orders VALUES
(1, 'Cambio de filtros motor', 'AA-BB11', 'Pedro Salinas', 1, 'Carlos Rivas', 'Alta', 'Pendiente', 'Revisión completa del sistema de lubricación y cambio de filtros.', '2024-05-12'),
(2, 'Revisión frenos', 'CC-DD22', 'Valentina Soto', 2, 'Elena Muñoz', 'Media', 'Pendiente', 'Diagnóstico y ajuste de frenos tras reporte de vibración.', '2024-06-03');

INSERT INTO order_parts (order_id, nombre, cantidad, costo) VALUES
(1, 'Filtro de aceite', 2, 45000),
(1, 'Filtro de combustible', 1, 38000),
(2, 'Pastillas freno traseras', 4, 29000);

INSERT INTO documents VALUES
(1, 1, 'AA-BB11', 'Permiso de circulación', '2024-11-05', 'Carlos Rivas', NULL, NULL, NULL, NULL),
(2, 2, 'CC-DD22', 'Revisión técnica', '2024-08-18', 'Elena Muñoz', NULL, NULL, NULL, NULL),
(3, 1, 'AA-BB11', 'Seguro obligatorio', '2025-02-01', 'Administración', NULL, NULL, NULL, NULL);

INSERT INTO expenses VALUES
(1, 'AA-BB11', 'Juego de neumáticos', 520000, '2024-04-20', NULL, NULL, NULL),
(2, 'CC-DD22', 'Kit de frenos', 315000, '2024-05-10', NULL, NULL, NULL);

INSERT INTO maintenance_programs VALUES
(1, 'AA-BB11', 'Cambio de aceite motor', 'km', '2024-05-01', 123000, 8000, '131000 km'),
(2, 'CC-DD22', 'Revisión general', 'fecha', '2024-06-15', NULL, 90, '12-09-2024');

INSERT INTO order_budgets VALUES
(1, 1, 128000, 'Pendiente', '', '2024-06-15T09:00:00', '2024-06-15T09:00:00'),
(2, 2, 29000, 'Aprobado', 'Continuar con la revisión según cronograma.', '2024-06-20T10:30:00', '2024-06-22T14:45:00');

INSERT INTO notifications (id, message, type, order_id, budget_id, read, created_at) VALUES
(1, 'El presupuesto de la OT \"Revisión frenos\" fue aprobado.', 'success', 2, 2, FALSE, '2024-06-22T15:00:00');
