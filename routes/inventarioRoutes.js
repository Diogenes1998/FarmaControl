const express = require('express');

const controlador = require('../controllers/inventarioController');
const { envolver } = require('../middleware/errores');

const router = express.Router();

// Solo lectura: los ingresos se registran en /api/recepciones (cierre de actas)
router.get('/', envolver(controlador.listar));

module.exports = router;
