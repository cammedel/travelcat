-- ------------------------------------------------------------
-- Esquema base de datos para el sistema de mantenimiento GMAO
-- Uso sugerido: importar en phpMyAdmin
-- ------------------------------------------------------------

DROP DATABASE IF EXISTS gmao_mantenimiento;
CREATE DATABASE gmao_mantenimiento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gmao_mantenimiento;

-- ------------------------------------------------------------
-- Tabla de usuarios del sistema
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(120) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

INSERT INTO usuarios (nombre, email, password)
VALUES ('Administrador General', 'admin@example.com', '$2y$10$ZrNLezW6GsgyVnHuxVEk6uP4tG6fXZ7GJ/t97yKMW.MZQ/rY8JTeu');
-- Password hash corresponde a "admin123"

-- ------------------------------------------------------------
-- Catálogo de conductores
-- ------------------------------------------------------------
CREATE TABLE conductores (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(120) NOT NULL,
    licencia  VARCHAR(20)  NOT NULL,
    telefono  VARCHAR(40)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Tabla de camiones / activos de la flota
-- ------------------------------------------------------------
CREATE TABLE camiones (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patente        VARCHAR(12) NOT NULL UNIQUE,
    marca          VARCHAR(80) NOT NULL,
    modelo         VARCHAR(120) NOT NULL,
    anio           SMALLINT,
    km             INT,
    fecha_entrada  DATE,
    fecha_salida   DATE,
    estado         VARCHAR(40) DEFAULT 'Operativo',
    notas          TEXT,
    conductor_id   INT UNSIGNED,
    creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_camion_conductor FOREIGN KEY (conductor_id) REFERENCES conductores (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Documentación asociada a cada camión (permiso, revisión, etc.)
-- ------------------------------------------------------------
CREATE TABLE documentos_camion (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    camion_id      INT UNSIGNED NOT NULL,
    tipo           VARCHAR(120) NOT NULL,
    vence          DATE,
    responsable    VARCHAR(120),
    archivo_nombre VARCHAR(255),
    archivo_ruta   VARCHAR(255),
    mime_type      VARCHAR(120),
    tamano_bytes   BIGINT,
    creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_camion FOREIGN KEY (camion_id) REFERENCES camiones (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Proveedores de servicios / repuestos
-- ------------------------------------------------------------
CREATE TABLE proveedores (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    razon_social  VARCHAR(150) NOT NULL,
    empresa       VARCHAR(150) NOT NULL,
    rut           VARCHAR(20)  NOT NULL UNIQUE,
    contacto      VARCHAR(120) NOT NULL,
    telefono      VARCHAR(40),
    email         VARCHAR(150),
    rubro         VARCHAR(150),
    creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Órdenes de trabajo (OT)
-- ------------------------------------------------------------
CREATE TABLE ordenes_trabajo (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo          VARCHAR(180) NOT NULL,
    patente         VARCHAR(12)  NOT NULL,
    camion_id       INT UNSIGNED,
    mecanico        VARCHAR(120) NOT NULL,
    proveedor_id    INT UNSIGNED,
    conductor       VARCHAR(120),
    prioridad       ENUM('Baja','Media','Alta') DEFAULT 'Media',
    estado          ENUM('Pendiente','En progreso','Finalizada') DEFAULT 'Pendiente',
    descripcion     TEXT,
    fecha_solicitud DATE,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ot_camion FOREIGN KEY (camion_id) REFERENCES camiones (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_ot_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE ordenes_repuestos (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    orden_id        INT UNSIGNED NOT NULL,
    descripcion     VARCHAR(180) NOT NULL,
    cantidad        INT UNSIGNED DEFAULT 0,
    costo_unitario  DECIMAL(12,2) DEFAULT 0,
    CONSTRAINT fk_repuesto_ot FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Registro de ventas mensuales (para el dashboard)
-- ------------------------------------------------------------
CREATE TABLE ventas_mensuales (
    id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    anio   SMALLINT     NOT NULL,
    mes    TINYINT      NOT NULL,
    monto  DECIMAL(14,2) NOT NULL,
    UNIQUE KEY uk_ventas_anio_mes (anio, mes)
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Programas de mantenimiento preventivo
-- ------------------------------------------------------------
CREATE TABLE programas_mantenimiento (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    camion_id     INT UNSIGNED,
    patente       VARCHAR(12) NOT NULL,
    tarea         VARCHAR(180) NOT NULL,
    tipo_control  ENUM('km','fecha') NOT NULL,
    fecha_base    DATE,
    ultimo_km     INT,
    intervalo     INT NOT NULL,
    proximo_control VARCHAR(60),
    creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_programa_camion FOREIGN KEY (camion_id) REFERENCES camiones (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Gastos y boletas asociadas
-- ------------------------------------------------------------
CREATE TABLE gastos (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    camion_id      INT UNSIGNED,
    patente        VARCHAR(12) NOT NULL,
    concepto       VARCHAR(180) NOT NULL,
    costo          DECIMAL(14,2) NOT NULL,
    fecha          DATE NOT NULL,
    boleta_nombre  VARCHAR(255),
    boleta_ruta    VARCHAR(255),
    boleta_mime    VARCHAR(120),
    creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gasto_camion FOREIGN KEY (camion_id) REFERENCES camiones (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

-- ------------------------------------------------------------
-- Datos demo opcionales (camiones / conductores / proveedores)
-- ------------------------------------------------------------
INSERT INTO conductores (nombre, licencia, telefono) VALUES
('Carlos Rivas', 'A5', '+56 9 1111 1111'),
('Elena Muñoz', 'A4', '+56 9 2222 2222'),
('Luis Fernández', 'A5', '+56 9 3333 3333');

INSERT INTO camiones (patente, marca, modelo, anio, km, fecha_entrada, estado, notas, conductor_id)
VALUES
('AA-BB11', 'Volvo', 'FH16', 2021, 125430, '2021-02-15', 'Operativo', 'Camión principal para rutas largas', 1),
('CC-DD22', 'Scania', 'R500', 2019, 210780, '2019-09-08', 'Operativo', 'Pendiente revisión técnica trimestral', 2);

INSERT INTO documentos_camion (camion_id, tipo, vence, responsable)
VALUES
(1, 'Permiso de circulación', '2024-11-05', 'Carlos Rivas'),
(2, 'Revisión técnica', '2024-08-18', 'Elena Muñoz'),
(1, 'Seguro obligatorio', '2025-02-01', 'Administración');

INSERT INTO proveedores (razon_social, empresa, rut, contacto, telefono, email, rubro) VALUES
('Servicios Diesel Limitada', 'Servicios Diesel', '761234567', 'Juan Pérez', '+56 9 5555 5555', 'contacto@serviciosdiesel.cl', 'Mantención de motores'),
('Tecnologías Hidráulicas SPA', 'TecHidráulica', '789876543', 'María González', '+56 2 2345 6789', 'ventas@techidraulica.cl', 'Reparación de sistemas hidráulicos');

INSERT INTO ventas_mensuales (anio, mes, monto) VALUES
(2024, 1, 12000000), (2024, 2, 9800000), (2024, 3, 13100000), (2024, 4, 14250000),
(2024, 5, 15120000), (2024, 6, 16080000), (2024, 7, 14800000), (2024, 8, 15230000),
(2024, 9, 16740000), (2024,10, 17120000), (2024,11, 18950000), (2024,12, 21000000);

INSERT INTO programas_mantenimiento (camion_id, patente, tarea, tipo_control, fecha_base, ultimo_km, intervalo, proximo_control)
VALUES
(1, 'AA-BB11', 'Cambio de aceite motor', 'km', '2024-05-01', 123000, 8000, '131000 km'),
(2, 'CC-DD22', 'Revisión general', 'fecha', '2024-06-15', NULL, 90, '12-09-2024');

INSERT INTO gastos (camion_id, patente, concepto, costo, fecha)
VALUES
(1, 'AA-BB11', 'Juego de neumáticos', 520000, '2024-04-20'),
(2, 'CC-DD22', 'Kit de frenos', 315000, '2024-05-10');

INSERT INTO ordenes_trabajo (titulo, patente, camion_id, mecanico, proveedor_id, conductor, prioridad, estado, descripcion, fecha_solicitud)
VALUES
('Cambio de filtros motor', 'AA-BB11', 1, 'Pedro Salinas', 1, 'Carlos Rivas', 'Alta', 'En progreso', 'Revisión completa del sistema de lubricación y cambio de filtros.', '2024-05-12'),
('Revisión frenos', 'CC-DD22', 2, 'Valentina Soto', 2, 'Elena Muñoz', 'Media', 'Pendiente', 'Diagnóstico y ajuste de frenos tras reporte de vibración.', '2024-06-03');

INSERT INTO ordenes_repuestos (orden_id, descripcion, cantidad, costo_unitario)
VALUES
(1, 'Filtro de aceite', 2, 45000),
(1, 'Filtro de combustible', 1, 38000),
(2, 'Pastillas freno traseras', 4, 29000);

-- ------------------------------------------------------------
-- Presupuestos asociados a cada orden de trabajo
-- ------------------------------------------------------------
CREATE TABLE presupuestos_ot (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    orden_id        INT UNSIGNED NOT NULL,
    monto_solicitado DECIMAL(14,2) NOT NULL,
    estado          ENUM('Pendiente','Aprobado','Parcial','Rechazado') DEFAULT 'Pendiente',
    observacion     TEXT,
    creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_presupuesto_ot FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

INSERT INTO presupuestos_ot (orden_id, monto_solicitado, estado, observacion, creado_en, actualizado_en)
VALUES
(1, 128000, 'Pendiente', '', '2024-06-15 09:00:00', '2024-06-15 09:00:00'),
(2, 29000, 'Aprobado', 'Continuar con la revisión según cronograma.', '2024-06-20 10:30:00', '2024-06-22 14:45:00');

-- ------------------------------------------------------------
-- Notificaciones del sistema (alertas de presupuesto, etc.)
-- ------------------------------------------------------------
CREATE TABLE notificaciones (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mensaje     VARCHAR(255) NOT NULL,
    tipo        ENUM('info','success','warning','danger') DEFAULT 'info',
    orden_id    INT UNSIGNED,
    presupuesto_id INT UNSIGNED,
    leida       TINYINT(1) DEFAULT 0,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leida_en    TIMESTAMP NULL,
    CONSTRAINT fk_notif_ot FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo (id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_notif_presupuesto FOREIGN KEY (presupuesto_id) REFERENCES presupuestos_ot (id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

INSERT INTO notificaciones (mensaje, tipo, orden_id, presupuesto_id, leida, creado_en)
VALUES
('El presupuesto de la OT "Revisión frenos" fue aprobado.', 'success', 2, 2, 0, '2024-06-22 15:00:00');
