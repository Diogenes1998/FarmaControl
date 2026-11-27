-- ============================================================
-- FarmaControl · PASO 1: base de datos y tabla de productos
-- Orden de ejecución en MySQL Workbench:
--   1. sql/drogueria_db.sql       (este archivo)
--   2. sql/recepcion_tecnica.sql  (actas, lotes, historial y unidades_por_caja)
--   3. sql/datos_prueba.sql       (opcional: 12 productos, 5 actas y 20 lotes de ejemplo)
-- Se puede ejecutar varias veces: no borra ni duplica nada.
-- ============================================================

CREATE DATABASE IF NOT EXISTS drogueria_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE drogueria_db;
SET NAMES utf8mb4;

-- Catálogo base: stock = cajas · precio = precio por caja
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  categoria VARCHAR(100) NOT NULL
);

-- Solicitudes del formulario de contacto (vista "Asistente y contacto").
-- El servidor también la crea automáticamente si no existe.
CREATE TABLE IF NOT EXISTS solicitudes_contacto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL,
  apellidos VARCHAR(20) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  telefono VARCHAR(15) NOT NULL,
  descripcion VARCHAR(500) NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
